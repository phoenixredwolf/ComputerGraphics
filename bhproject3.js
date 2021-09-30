/**
 * Barret Vogtman
 * Project 1 - Problem 4
 * Computer Graphics
 **/

// Set global Variables
var gl;
var program;
var program2;
var program3;
var program4;
var aspect;
var posit = vec3(0.0,0.0,0.0)
var sunPosition = vec3(12.0,6.0,0.0)
var verticesMountains;
var verticesSun;
var verticesShortRays;
var verticesLongRays;
var degs = 0;
var rotRays = 0;
var PMat;
var n;

// Set Matrix
var left = -10;     // left limit of world coords
var right = 10;     // right limit of world coords
var bottom = -10;   // bottom limit of world coords
var topBorder = 10; // top limit of worlds coord
var near = -10;     // near clip plane
var far = 10;       // far clip plane

// Define callback function for window.onload
window.onload = function init()
{
  var canvas = document.getElementById( "gl-canvas" ); // Get HTML canvas

  gl = canvas.getContext('webgl2');                    // Get a WebGL 2.0 context
  if ( !gl ) { alert( "WebGL isn't available" ); }

  // Mountain vertices
  verticesMountains = [
    vec2( -20.0,-10.0),
    vec2( -3, 3.0),
    vec2( 20, -10)
  ]

  // Calc vertices for the sun
  verticesSun = []

  for (var i=0.0; i<=360; i++){
    var j = DegsToRads(i);
    var vert1 = [vec2(
      Math.sin(j),
      Math.cos(j)
    )];
    verticesSun = verticesSun.concat(vert1)
  }
  n=verticesSun.length;

  // Vertices for suns rays
  verticesShortRays = [
    vec2( 0.0, 0.0),
    vec2( 1.0, 0.0),
    vec2( 1.0, 0.1),
    vec2( 0.0, 0.1)
  ]

  verticesLongRays = [
    vec2( 0.0, 0.0),
    vec2( 2.0, 0.0),
    vec2( 2.0, 0.1),
    vec2( 0.0, 0.1)
  ]

  //  Configure WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor( 0.0, 0.0, 1.0, 1.0 );        // Set background color of the viewport to black

  //  Load shaders and initialize attribute buffers
  program = initShaders( gl, "vertex-shader", "fragment-shader" ); // Compile and link shaders to form a program
  program2 = initShaders( gl, "vertex-shader", "fragment-shader" );

  aspect = canvas.width / canvas.height;                      // get the aspect ratio of the canvas
  left  *= aspect;                                            // left limit of world coords
  right *= aspect;                                            // right limit of world coords
  PMat = ortho(left, right, bottom, topBorder, near, far);    // Call function to compute orthographic projection matrix
  // Done setting View Transformation matrix


  program = initShaders(gl, "vertex-shader", "fragment-shader");
  program2 = initShaders(gl, "vertex-shader", "fragment-shader");
  program3 = initShaders(gl, "vertex-shader", "fragment-shader");
  program4 = initShaders(gl, "vertex-shader", "fragment-shader");

  gl.useProgram(program);

  // Load the data into the GPU

  var bufferId = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(verticesMountains), gl.STATIC_DRAW );

  // Associate our shader variables with our data buffer

  var vPosition = gl.getAttribLocation( program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  render();
};

function render() {

  degs = degs + 1;
  rotRays += 1;
  gl.clear(gl.COLOR_BUFFER_BIT);                             // Clear the canvas with gl.clearColor defined above

  DrawMountain(vec3(0.0,0.0,0.0));
  DrawMountain(vec3(-10.0,-2.0,0.0));
  DrawMountain(vec3(15.0,-3.0,0.0));

  DrawSun(degs, sunPosition);
  // Draw the cars
  DrawShortRays(-rotRays, sunPosition);
  DrawShortRays(-degs-60, sunPosition);
  DrawShortRays(-degs-120, sunPosition);
  DrawShortRays(-degs-180, sunPosition);
  DrawShortRays(-degs-240, sunPosition);
  DrawShortRays(-degs-300, sunPosition);
  DrawLongRays(degs+30,sunPosition);
  DrawLongRays(degs+90,sunPosition);
  DrawLongRays(degs+150,sunPosition);
  DrawLongRays(degs+210,sunPosition);
  DrawLongRays(degs+270,sunPosition);
  DrawLongRays(degs+330,sunPosition);

}
function DrawMountain(trans)
{
  gl.useProgram(program);                                               // Make this the active shaer program
  // Initalize VBO1 for Hexagon, load on GPU, and bind
  var vPositionLoc = gl.getAttribLocation(program, "vPosition");  // Link js vPosition with "vertex shader attribute variable" - vPosition
  var vbo = Vbo(gl, verticesMountains, 2);
  vbo.BindToAttribute(vPositionLoc);      // Associate the shader attribute VPosition with the appropriate VBO and bind

  var P_loc = gl.getUniformLocation(program, "P");       // Get Vertex shader memory location for P
  gl.uniformMatrix4fv(P_loc, false, flatten(PMat));   // Set uniform variable P on GPU

  var MV_loc = gl.getUniformLocation(program, "MV");           // Get Vertex shader memory location for the MV matrix
  var colorLoc = gl.getUniformLocation(program, "color");      // Get fragment shader memory location of color

  var R = translate(trans[0], trans[1], trans[2]);

  scaleMat = scale(1.0, 1.0, 0.0);               // Scale unit square in x-direction by 5.0 to form a 5x1 rectangle
  translateMat = translate(0.0, 0.0, 0.0);       // Translate the 5x1 rectangle down -2.0 in the y direction
  modelView = mult(translateMat, scaleMat);      // Compose the scale and the translate via matrix multiply storing the result in the modelView matrix
  modelView = mult(R, modelView);

  gl.uniformMatrix4fv(MV_loc, false, flatten(modelView));      // push values of modelView matrix down to the vertex shader uniform variable MV
  gl.uniform4f(colorLoc, 0.0, 0.55, 0.0, 1.0);               // Set RGB of frangment shader uniform variable "color" to yellow
  gl.drawArrays(gl.TRIANGLES, 0, 3);                         // Invoke the render of the mouth rectangle
}

function DrawSun(degs, pivot)
{
  gl.useProgram(program4);                                               // Make this the active shaer program
  // Initalize VBO1 for Hexagon, load on GPU, and bind
  var vPositionLoc = gl.getAttribLocation(program4, "vPosition");  // Link js vPosition with "vertex shader attribute variable" - vPosition
  var vbo4 = Vbo(gl, verticesSun, 2);
  vbo4.BindToAttribute(vPositionLoc);      // Associate the shader attribute VPosition with the appropriate VBO and bind

  var P_loc4 = gl.getUniformLocation(program4, "P");       // Get Vertex shader memory location for P
  gl.uniformMatrix4fv(P_loc4, false, flatten(PMat));   // Set uniform variable P on GPU

  var MV_loc4 = gl.getUniformLocation(program4, "MV");           // Get Vertex shader memory location for the MV matrix
  var colorLoc4 = gl.getUniformLocation(program4, "color");      // Get fragment shader memory location of color

  var R1 = rotateZ(degs);
  var T = translate(pivot[0], pivot[1], pivot[2]);
  var R = mult(T, R1);

  scaleMat = scale(1.0, 1.0, 0.0);               // Scale unit square in x-direction by 5.0 to form a 5x1 rectangle
  translateMat = translate(0.0, 0.0, 0.0);       // Translate the 5x1 rectangle down -2.0 in the y direction
  modelView = mult(translateMat, scaleMat);      // Compose the scale and the translate via matrix multiply storing the result in the modelView matrix
  modelView = mult(R, modelView);

  gl.uniformMatrix4fv(MV_loc4, false, flatten(modelView));      // push values of modelView matrix down to the vertex shader uniform variable MV
  gl.uniform4f(colorLoc4, 1.0, 1.0, 0.0, 1.0);               // Set RGB of frangment shader uniform variable "color" to yellow
  gl.drawArrays(gl.TRIANGLE_FAN, 0, n);                         // Invoke the render of the mouth rectangle
}

function DrawShortRays(degs, pivot)
{
  gl.useProgram(program2);
  var vPostionLoc2 = gl.getAttribLocation(program2, "vPosition");
  var vbo2 = Vbo(gl, verticesShortRays, 2);
  vbo2.BindToAttribute(vPostionLoc2);

  var P_loc2 = gl.getUniformLocation(program2, "P");
  gl.uniformMatrix4fv(P_loc2, false, flatten(PMat));

  var MV_loc2 = gl.getUniformLocation(program2, "MV");           // Get Vertex shader memory location for the MV matrix
  var colorLoc2 = gl.getUniformLocation(program2, "color");      // Get fragment shader memory location of color

  var R1 = rotateZ(degs);
  var T = translate(pivot[0], pivot[1], pivot[2]);
  var R = mult(T, R1);

  scaleMat = scale(1, 1, 0.0);
  translateMat = translate(1.5, 0.0, 0.0);
  modelView = mult(translateMat, scaleMat);
  modelView = mult(R, modelView);

  gl.uniformMatrix4fv(MV_loc2, false, flatten(modelView));
  gl.uniform4f(colorLoc2, 1.0, 1.0, 0.0, 1.0);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function DrawLongRays(degs, pivot)
{
  gl.useProgram(program2);
  var vPostionLoc3 = gl.getAttribLocation(program2, "vPosition");
  var vbo3 = Vbo(gl, verticesLongRays, 2);
  vbo3.BindToAttribute(vPostionLoc3);

  var P_loc3 = gl.getUniformLocation(program2, "P");
  gl.uniformMatrix4fv(P_loc3, false, flatten(PMat));

  var MV_loc3 = gl.getUniformLocation(program2, "MV");           // Get Vertex shader memory location for the MV matrix
  var colorLoc3 = gl.getUniformLocation(program2, "color");      // Get fragment shader memory location of color

  var R1 = rotateZ(degs);
  var T = translate(pivot[0], pivot[1], pivot[2]);
  var R = mult(T, R1);

  scaleMat = scale(1, 1, 0.0);
  translateMat = translate(1.5, 0.0, 0.0);
  modelView = mult(translateMat, scaleMat);
  modelView = mult(R, modelView);

  gl.uniformMatrix4fv(MV_loc3, false, flatten(modelView));
  gl.uniform4f(colorLoc3, 1.0, 1.0, 0.0, 1.0);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function DegsToRads (degree) {
  var rad = degree * (Math.PI / 180);
  return rad
}

