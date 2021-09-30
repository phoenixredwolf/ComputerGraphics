/**
* Barret Vogtman
* Project 1 - Problem 1&2
* Computer Graphics
 **/

// Set global Variables
var gl;
var program;
var scaleX = 1;     // for zoom
var scaleY = 1;     // for zoom
var interval_;      // for mouse being held down on buttons
var aspect;
var rot = false;
var degs = 0;
var posit = vec3(0.0,0.0,0.0)
var red = .5;
var blue = 0.0;
var green = 0.0;

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


  // Four Vertices

  var vertices = [
    vec2(-0.5,-0.5),
    vec2( 0.5,-0.5),
    vec2( 0.5, 0.5),
    vec2(-0.5, 0.5)
  ];

  //
  //  Configure WebGL
  //
  gl.viewport(0, 0, canvas.width, canvas.height);  // What part of html are we looking at?
  gl.clearColor( 0.0, 0.0, 0.0, 1.0 );               // Set background color of the viewport to black

  //  Load shaders and initialize attribute buffers
  program = initShaders( gl, "vertex-shader", "fragment-shader" ); // Compile and link shaders to form a program
  gl.useProgram(program);                                              // Make this the active shaer program

  aspect = canvas.width / canvas.height;        // get the aspect ratio of the canvas
  left  *= aspect;                                  // left limit of world coords
  right *= aspect;                                  // right limit of world coords

  // Done setting View Transformation matrix

  // Initalize VBO1 for Square, load on GPU, and bin
  var vPositionLoc = gl.getAttribLocation(program, "vPosition");        // Link js vPosition with "vertex shader attribute variable" - vPosition

  var vbo = Vbo(gl, vertices, 2);
  vbo.BindToAttribute(vPositionLoc);       // Associate the shader attribute VPosition with the appropriate VBO and bind

  render();
};

// Three callback functions for 3 color sliders, one red, one green, and one blue
document.getElementById("Red").onchange = function () { red = event.srcElement.value / 255; };
document.getElementById("Green").onchange = function () { green = event.srcElement.value / 255; };
document.getElementById("Blue").onchange = function () { blue = event.srcElement.value / 255; };

// Pan button callback functions
document.getElementById("pan_left").onmousedown = function () {
  interval_ = setInterval(function () {left += -0.2; right += -0.2 }, 50)};
document.getElementById("pan_left").onmouseup = function (){ clearInterval(interval_) };
document.getElementById("pan_right").onmousedown = function () {
  interval_ = setInterval(function () { left += 0.2; right += 0.2 }, 50)};
document.getElementById("pan_right").onmouseup = function (){ clearInterval(interval_) };
document.getElementById("pan_down").onmousedown = function () {
  interval_ = setInterval(function () { bottom += -0.2; topBorder += -0.2 }, 50)};
document.getElementById("pan_down").onmouseup = function (){ clearInterval(interval_) };
document.getElementById("pan_up").onmousedown = function () {
  interval_ = setInterval(function () { bottom += 0.2; topBorder += 0.2 }, 50)};
document.getElementById("pan_up").onmouseup = function (){ clearInterval(interval_)};

// ZoomIn button callback functions
document.getElementById("zoom_in").onmousedown = function () {
  interval_ = setInterval(zoomIn, 50)};
document.getElementById("zoom_in").onmouseup = function () {
  clearInterval(interval_)};

// ZoomOut button callback Functions
document.getElementById("zoom_out").onmousedown = function () {
  interval_ = setInterval(zoomOut, 50)};
document.getElementById("zoom_out").onmouseup = function () {
  clearInterval(interval_) };

// Reset button callback
document.getElementById("reset").onclick = function () {
  left = -10 * aspect;
  right = 10 * aspect;
  topBorder = 10;
  bottom = -10;
  scaleX = 1;
  scaleY = 1;
  red = 0.5;
  blue = 0.0;
  green = 0.0;
  degs = 0.0;
  posit = vec3(0.0,0.0,0.0);
  document.getElementById("Red").value = 255/2;
  document.getElementById("Green").value = 255/2;
  document.getElementById("Blue").value = 255/2;
}

// Rotation function callback
document.getElementById("left_eye").onclick = function () { posit = vec3(-1.0,1.0,0.0); rot = true };
document.getElementById("right_eye").onclick = function () { posit = vec3(1.0,1.0,0.0); rot = true };
document.getElementById("nose").onclick = function () { posit = vec3(0.0,0.0,0.0); rot = true };
document.getElementById("stop").onclick = function () { rot = false };



window.addEventListener("keydown", keyboardPan, false);

// Functions that gets called to parse keydown events
function keyboardPan(e) {
  switch (e.keyCode) {
    case 37: // left arrow pan left
    {left += -0.1; right += -0.1}
      break;
    case 38: // up arrow pan left
    {bottom += 0.1; topBorder += 0.1}
      break;
    case 39: // right arrow pan left
    {left += 0.1; right += 0.1}
      break;
    case 40: // down arrow pan left
    {bottom += -0.1; topBorder += -0.1}
      break;
  }
}

function zoomIn() {
  scaleX += 0.05;
  scaleY += 0.05;
}

function zoomOut() {
  if (scaleY > 0.1) {
    scaleX -= 0.05;
    scaleY -= 0.05;
  }
}

function DrawSquare(degs, pivot)
{
  var MV_loc = gl.getUniformLocation(program, "MV");           // Get Vertex shader memory location for the MV matrix
  var colorLoc = gl.getUniformLocation(program, "color");      // Get fragment shader memory location of color

  var R1 = rotateZ(degs);
  var pivotI = negate(pivot);
  var TI = translate(pivotI[0], pivotI[1], pivotI[2]);
  var S = scale(scaleX, scaleY, 0);
  var R = mult(R1, mult(S,TI));

  gl.uniform4f(colorLoc, 1.0, 1.0, 0.0, 1.0);   // Set RGB of frangment shader uniform variable "color" to yellow

  scaleMat = scale(5.0, 5.0, 0.0);                          // Scale unit square in x-direction by 5.0 to form a 5x1 rectangle
  translateMat = translate(0.0, 0.0, 0.0);                  // Translate the 5x1 rectangle down -2.0 in the y direction
  modelView = mult(translateMat, scaleMat);                 // Compose the scale and the translate via matrix multiply storing the result in the modelView matrix
  modelView = mult(R, modelView);

  gl.uniformMatrix4fv(MV_loc, false, flatten(modelView));      // push values of modelView matrix down to the vertex shader uniform variable MV
  gl.uniform4f(colorLoc, 1.0, 1.0, 0.0, 1.0);               // Set RGB of frangment shader uniform variable "color" to yellow
  gl.drawArrays(gl.LINE_LOOP, 0, 4);                         // Invoke the render of the mouth rectangle

  gl.uniform4f(colorLoc, red, green, blue, 0.7);                     // Set RGB of frangment shader uniform variable "color" to yellow
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);                       // Draw two triangles using the TRIANGLE_FAN primitive using 4 vertices

  // Left Eye
  scaleMat = scale(0.5, 0.5, 0.0);
  translateMat = translate(-1.0, 1.0, 0.0);
  modelView = mult(translateMat, scaleMat);
  modelView = mult(R, modelView);

  gl.uniformMatrix4fv(MV_loc, false, flatten(modelView));
  gl.uniform4f(colorLoc, 1.0, 1.0, 0.0, 1.0);
  gl.drawArrays(gl.LINE_LOOP, 0, 4);

  // Right Eye
  scaleMat = scale(0.5, 0.5, 0.0);
  translateMat = translate(1.0, 1.0, 0.0);
  modelView = mult(translateMat, scaleMat);
  modelView = mult(R, modelView);

  gl.uniformMatrix4fv(MV_loc, false, flatten(modelView));
  gl.uniform4f(colorLoc, 1.0, 1.0, 0.0, 1.0);
  gl.drawArrays(gl.LINE_LOOP, 0, 4);

  // Nose
  scaleMat = scale(0.5, 0.5, 0.0);
  translateMat = translate(0.0, 0.0, 0.0);
  modelView = mult(translateMat, scaleMat);
  modelView = mult(R, modelView);

  gl.uniformMatrix4fv(MV_loc, false, flatten(modelView));
  gl.uniform4f(colorLoc, 1.0, 1.0, 0.0, 1.0);
  gl.drawArrays(gl.LINE_LOOP, 0, 4);

  // Mouth
  scaleMat = scale(2.5, 0.5, 0.0);
  translateMat = translate(0.0, -1.25, 0.0);
  modelView = mult(translateMat, scaleMat);
  modelView = mult(R, modelView);

  gl.uniformMatrix4fv(MV_loc, false, flatten(modelView));
  gl.uniform4f(colorLoc, 1.0, 1.0, 0.0, 1.0);
  gl.drawArrays(gl.LINE_LOOP, 0, 4);
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);                             // Clear the canvas with gl.clearColor defined above

  var PMat;                                                  // js variable to hold projection matrix
  PMat = ortho(left, right, bottom, topBorder, near, far);    // Call function to compute orthographic projection matrix

  var P_loc = gl.getUniformLocation(program, "P");           // Get Vertex shader memory location for P
  gl.uniformMatrix4fv(P_loc, false, flatten(PMat));          // Set uniform variable P on GPU

  //degs = degs + 1;

  switch (rot) {
    case true:
      DrawSquare(degs +=1, posit);
      break;
    case false:
      DrawSquare(degs, posit);
      break;


  }

  requestAnimationFrame(render);                             // swap buffers, continue render loop
}
