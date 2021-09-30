/**
 * Barret Vogtman
 * Project 1 - Problem 3
 * Computer Graphics
 **/

// Set global Variables
var gl;
var program;
var aspect;
var degs = 0;
var posit = vec3(0.0,0.0,0.0)
var pivotCar = vec3(5.0,0.0,0.0)
var vertices;
var verticesCars;
var PMat;

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

  // Ferris Wheel Structure vertices
  vertices = [
    vec2( 0.0, 0.0),
    vec2( 5.0, 0.0),
    vec2( 2.5, 4.33)
  ]

  // Ferris Wheel Cars
  verticesCars = [
    vec2( 0.0, 0.0),
    vec2( 1.0, 0.0),
    vec2( 1.0, 1.0),
    vec2( 0.0, 1.0)
  ]

  //  Configure WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor( 0.0, 0.0, 0.0, 1.0 );        // Set background color of the viewport to black

  //  Load shaders and initialize attribute buffers
  program = initShaders( gl, "vertex-shader", "fragment-shader" ); // Compile and link shaders to form a program
  program2 = initShaders( gl, "vertex-shader", "fragment-shader" );

  aspect = canvas.width / canvas.height;                      // get the aspect ratio of the canvas
  left  *= aspect;                                            // left limit of world coords
  right *= aspect;                                            // right limit of world coords
  PMat = ortho(left, right, bottom, topBorder, near, far);    // Call function to compute orthographic projection matrix
  // Done setting View Transformation matrix

  render();
};

function DrawFerrisWheel(degs, pivot)
{
  gl.useProgram(program);                                               // Make this the active shaer program
  // Initalize VBO1 for Hexagon, load on GPU, and bind
  var vPositionLoc = gl.getAttribLocation(program, "vPosition");  // Link js vPosition with "vertex shader attribute variable" - vPosition
  var vbo = Vbo(gl, vertices, 2);
  vbo.BindToAttribute(vPositionLoc);      // Associate the shader attribute VPosition with the appropriate VBO and bind

  var P_loc = gl.getUniformLocation(program, "P");       // Get Vertex shader memory location for P
  gl.uniformMatrix4fv(P_loc, false, flatten(PMat));   // Set uniform variable P on GPU

  var MV_loc = gl.getUniformLocation(program, "MV");           // Get Vertex shader memory location for the MV matrix
  var colorLoc = gl.getUniformLocation(program, "color");      // Get fragment shader memory location of color

  var R1 = rotateZ(degs);
  var TI = translate(pivot[0], pivot[1], pivot[2]);
  var R = mult(R1, TI);

  scaleMat = scale(1.0, 1.0, 0.0);               // Scale unit square in x-direction by 5.0 to form a 5x1 rectangle
  translateMat = translate(0.0, 0.0, 0.0);       // Translate the 5x1 rectangle down -2.0 in the y direction
  modelView = mult(translateMat, scaleMat);      // Compose the scale and the translate via matrix multiply storing the result in the modelView matrix
  modelView = mult(R, modelView);

  gl.uniformMatrix4fv(MV_loc, false, flatten(modelView));      // push values of modelView matrix down to the vertex shader uniform variable MV
  gl.uniform4f(colorLoc, 1.0, 1.0, 0.0, 1.0);               // Set RGB of frangment shader uniform variable "color" to yellow
  gl.drawArrays(gl.LINE_LOOP, 0, 3);                         // Invoke the render of the mouth rectangle
}

function DrawCars(degs, pivot)
{
  gl.useProgram(program2);
  var vPostionLoc2 = gl.getAttribLocation(program2, "vPosition");
  var vbo2 = Vbo(gl, verticesCars, 2);
  vbo2.BindToAttribute(vPostionLoc2);

  var P_loc2 = gl.getUniformLocation(program2, "P");
  gl.uniformMatrix4fv(P_loc2, false, flatten(PMat));

  var MV_loc2 = gl.getUniformLocation(program2, "MV");           // Get Vertex shader memory location for the MV matrix
  var colorLoc2 = gl.getUniformLocation(program2, "color");      // Get fragment shader memory location of color

  var R1 = rotateZ(degs);
  var R2 = rotateZ(degs, vec3(0,0,0))
  var T = translate(pivot[0], pivot[1],pivot[2]);
  var pivotI = negate(pivot)
  var TI = translate(pivotI[0], pivotI[1], pivotI[2]);
  var R = mult(T, mult(R1, TI));

  scaleMat = scale(1, 1, 0.0);
  translateMat = translate(4.5, -0.5, 0.0);
  modelView = mult(translateMat, scaleMat);
  modelView = mult(R2, mult(R, modelView));

  gl.uniformMatrix4fv(MV_loc2, false, flatten(modelView));
  gl.uniform4f(colorLoc2, 0.0, 1.0, 1.0, 1.0);
  gl.drawArrays(gl.LINE_LOOP, 0, 4);
}

function render() {

  gl.clear(gl.COLOR_BUFFER_BIT);                             // Clear the canvas with gl.clearColor defined above

  degs += 1;

  // Draw the Structure
  DrawFerrisWheel(degs, posit)
  DrawFerrisWheel(60 + degs, posit)
  DrawFerrisWheel(120 + degs, posit)
  DrawFerrisWheel(180 + degs, posit)
  DrawFerrisWheel(240 + degs, posit)
  DrawFerrisWheel(300 + degs, posit)

  // Draw the cars
  DrawCars(degs, pivotCar)
  DrawCars(60 + degs, pivotCar)
  DrawCars(120+ degs, pivotCar)
  DrawCars(180+ degs, pivotCar)
  DrawCars(240+ degs, pivotCar)
  DrawCars(300+ degs, pivotCar)

  requestAnimationFrame(render);                             // swap buffers, continue render loop
}
