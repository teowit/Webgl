// Your code here!
var vertexShaderText =
    [
        'precision mediump float;',
        '',
        'attribute vec3 vertPosition;',
        'attribute vec2 vertTexCoord;',
        'varying vec2 fragTexCoord;',
        'uniform mat4 mWorld;',
        'uniform mat4 mView;',
        'uniform mat4 mProj;',
        '',
        'void main()',
        '{',
        '  fragTexCoord = vertTexCoord;',
        ' /* Rotation matrix are multiplied from right to left */',
        ' /* the order of rotating matrices is important */',
        '  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
        '}'
    ].join('\n');

// Shader with input from vertexShader (fragColor = vertColor)
// Now implementation with texture. We added the sampler
var fragmentShaderText =
    [
        'precision mediump float;',
        '',
        'varying vec2 fragTexCoord;',
        'uniform sampler2D sampler;',
        '',
        'void main()',
        '{',
        '  gl_FragColor = texture2D(sampler, fragTexCoord);',
        '}'
    ].join('\n');

var InitDemo = function () {
    console.log('this is working');

    var canvas = document.getElementById('game-surface');
    var gl = canvas.getContext('webgl');

    if (!gl) {
        console.log('WebGL not supported. Trying experimental');
        gl = canvas.getContext('experimental-webgl');
    }
    if (!gl) {
        alert('Your browser does not support WebGL');
    }

    // Clear the canvas through the context
    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); // check which pixel is behind an other (still draws but respects its position)
    gl.enable(gl.CULL_FACE); // Don't use resources on items that are behind others
    gl.frontFace(gl.CCW); //identify the front face and never show the backside. Not sure how this works with a camera ??
    gl.cullFace(gl.BACK);

    // Setup vertex and fragment shaders
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    // Compile shaders
    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
        return;
    }
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
        return;
    }

    // Create graphics card program
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(program));
        return;
    }

    // Validate the program but remove after debug session
    // this command takes quite a bit of resources
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('ERROR program validation!', gl.getProgramInfoLog(program));
        return;
    }

    // Set all the data the graphics card needs

    // Create buffer
    // First create some Vertices
    // This is a box instead
    var boxVertices =
        [ // x,y,z            U, V
            // Top
            -1.0, 1.0, -1.0, 0, 0, 
            -1.0, 1.0, 1.0, 0, 1,
            1.0, 1.0, 1.0, 1, 1,
            1.0, 1.0, -1.0, 1, 0,
            // Left
            -1.0, 1.0, 1.0, 0, 0,
            -1.0, -1.0, 1.0, 1, 0,
            -1.0, -1.0, -1.0, 1, 1,
            -1.0, 1.0, -1.0, 0, 1,
            // Right
            1.0, 1.0, 1.0, 1, 1,
            1.0, -1.0, 1.0, 0, 1,
            1.0, -1.0, -1.0, 0, 0,
            1.0, 1.0, -1.0, 1, 0,
            // Front
            1.0, 1.0, 1.0, 1, 1,
            1.0, -1.0, 1.0, 1, 0,
            -1.0, -1.0, 1.0, 0, 0,
            -1.0, 1.0, 1.0, 0, 1,
            // Back
            1.0, 1.0, -1.0, 0, 0,
            1.0, -1.0, -1.0, 0, 1,
            -1.0, -1.0, -1.0, 1, 1,
            -1.0, 1.0, -1.0, 1, 0,
            // Bottom
            -1.0, -1.0, -1.0, 1, 1,
            -1.0, -1.0, 1.0, 1, 0,
            1.0, -1.0, 1.0, 0, 0,
            1.0, -1.0, -1.0, 0, 1
        ];
    //  identifies which indexes form a triangle
    // first one 0,1,2 identifies that 
    //    -1.0, 1.0, -1.0 
    //    -1.0, 1.0,  1.0 
    //     1.0, 1.0,  1.0
    // is one of the triangle on top. The otherone is 0,2,4
    var boxIndices =
        [
            // Top
            0, 1, 2,
            0, 2, 3,
            // Left
            5, 4, 6,
            6, 4, 7,
            //Right
            8, 9, 10,
            8, 10, 11,
            // Front
            13, 12, 14,
            15, 14, 12,
            // Back
            16, 17, 18,
            16, 18, 19,
            //Bottom
            21, 20, 22,
            22, 20, 23
        ];

    // Create the buffer and bind the vertices to it
    var boxVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
    //buffer data needs 32 bit array. Java saves the vertices array as 64 bit
    // hence the conversion through Float32Array
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

    var boxIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);


    // See the vertPosition variable in the vertShader. Thios fetches its position in the shader text.
    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    //var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
    var texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');

    gl.vertexAttribPointer(
        positionAttribLocation, //Attribute location
        3, // Number of elements in each attribute (vec3)
        gl.FLOAT, // Type of elements
        gl.FALSE, // Is it normalised ?? Don't know what this means
        5 * Float32Array.BYTES_PER_ELEMENT,// Size of an individual vertex
        0 // Offset from the beginning of a single vertex to this attribute
    );

    gl.vertexAttribPointer(
        texCoordAttribLocation, //Attribute location
        2, // Number of elements in each attribute (vec2)
        gl.FLOAT, // Type of elements
        gl.FALSE, // Is it normalised ?? Don't know what this means
        5 * Float32Array.BYTES_PER_ELEMENT,// Size of an individual vertex
        3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
    );

    // Enable the vertice array
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(texCoordAttribLocation);

    // Create texture
    var boxTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    // Texture_wrap_s & t is openGL syno's for UVs
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('crate-image'));

    gl.bindTexture(gl.TEXTURE_2D, null);

    // Tell gl we use this program before uniformMatrix4fv call.
    // if this call comes after uniformMatrix4fv it will not know they are linked
    gl.useProgram(program);

    // define uniforms
    var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
    var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
    var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');


    var worldMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);

    // initialize them using the mat4 library in gl-matrix.js
    // see http://glmatrix.net/docs/module-mat4.html for documentation
    mat4.identity(worldMatrix); // just an identity. no actions
    mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]); //change -8 to -5 to get it closer
    mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

    var xRotationMatrix = new Float32Array(16);
    var yRotationMatrix = new Float32Array(16);

    // Render
    var identityMatrix = new Float32Array(16);
    mat4.identity(identityMatrix);
    var angle = 0;
    var loop = function () {
        angle = performance.now() / 1000 / 6 * 2 * Math.PI;
        // rotate the world matrix around the identity matrix by angle degrees and [0,1,0] axis
        mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
        mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
        // multiply them together and put it in the worldMatrix
        mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix); //Remember order is important with Matrixes
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

        // Clear the screen
        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.bindTexture(gl.TEXTURE_2D, boxTexture);
        gl.activeTexture(gl.TEXTURE0); //first sampler is at 0 next sampler would be TEXTURE1

        // How do we draw (TRIANGLES), what do we skip (0), How many do we draw (3)
        // gl.drawArrays(gl.TRIANGLES, 0, 3); This function was for the triangles
        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

};


