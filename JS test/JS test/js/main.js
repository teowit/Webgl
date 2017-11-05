// Your code here!
var vertexShaderText =
    [
        'precision mediump float;',
        '',
        'attribute vec2 vertPosition;',
        'attribute vec3 vertColor;',
        'varying vec3 fragColor;',
        '',
        'void main()',
        '{',
        '  fragColor = vertColor;',
        '  gl_Position = vec4(vertPosition, 0.0, 1.0);',
        '}'
    ].join('\n');

// Shader with just red color
var fragmentShaderText =
    [
        'precision mediump float;',
        '',
        'varying vec3 fragColor;',
        'void main()',
        '{',
        '  gl_FragColor = vec4(fragColor, 1.0);',
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

    // Setuup vertex and fragment shaders
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
    var triangleVertices =
        [ // x,y  R,G,B
            0.0, 0.5, 1.0, 1.0, 0.0,
            -0.5, -0.5, 0.7, 0.0, 1.0,
            0.5, -0.5, 0.1, 1.0, 0.6 
        ];
    // Create the buffer and bind the vertices to it
    var triangleVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    //buffer data needs 32 bit array. Java saves the vertices array as 64 bit
    // hence the conversion through Float32Array
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

    // See the vertPosition variable in the vertShader. Thios fetches its position in the shader text.
    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

    gl.vertexAttribPointer(
        colorAttribLocation, //Attribute location
        3, // Number of elements in each attribute (vec2)
        gl.FLOAT, // Type of elements
        gl.FALSE, // Is it normalised ?? Don't know what this means
        5 * Float32Array.BYTES_PER_ELEMENT,// Size of an individual vertex
        2 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
    );

    gl.vertexAttribPointer(
        positionAttribLocation, //Attribute location
        2, // Number of elements in each attribute (vec2)
        gl.FLOAT, // Type of elements
        gl.FALSE, // Is it normalised ?? Don't know what this means
        5 * Float32Array.BYTES_PER_ELEMENT,// Size of an individual vertex
        0 // Offset from the beginning of a single vertex to this attribute
    );


    // Enable the vertice array
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    // Main render loop
    gl.useProgram(program);
    // How do we draw (TRIANGLES), what do we skip (0), How many do we draw (3)
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}


/*
function vertexShader(vertPosition, vertColor) {
    return {
        fragColor: vertColor,
        gl_position: [vertPosition.x, vertPosition.y, 0.0, 1.0]
    }
    }
*/
