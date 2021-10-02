/**
 * Barret Vogtman
 * Project 1 - Problem 4
 * Computer Graphics
 **/

// Set global Variables
var gl;
var program;
var aspect;
var degs = 0;
var rotRays = 0;
var sunX = -18;
var sunY = -5.0;
var carX = -30.0;
var verticesSun;
var verticesShortRays;
var verticesLongRays;
var verticesMountains;
var verticesSnow;
var verticesRoad;
var verticesHub;
var backcolor;
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

  // Vertices for round objects
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

  // Vertices for the hubcaps
  verticesHub = [
    vec2( 0.0, 0.0),
    vec2( 0.0, 0.5),
    vec2( 0.25, 0.4330)
  ]

  // Vertices for shorter sunrays
  verticesShortRays = [
    vec2( 0.0, 0.0),
    vec2( 1.0, 0.0),
    vec2( 1.0, 0.1),
    vec2( 0.0, 0.1)
  ]

  // Vertices for longer sunrays
  verticesLongRays = [
    vec2( 0.0, 0.0),
    vec2( 2.0, 0.0),
    vec2( 2.0, 0.1),
    vec2( 0.0, 0.1)
  ]

  // Mountain vertices
  verticesMountains = [
    vec2( -35.0,-20.0),
    vec2( -3, 3.0),
    vec2( 30, -20)
  ]

  // Snow on Mountains
  verticesSnow = [
    vec2(-3.0, 3.0),
    vec2(-10,-2.03125),
    vec2(-7.0,-1.0),
    vec2(-5.0,-2.9),
    vec2(-1.0,-0.85),
    vec2( 1.5,-3.21),
    vec2( 4.17391,-2.0)
    ]

  // Vertices for changing sky
  verticesSky = [
    vec2(-28,-10),
    vec2(28, -10),
    vec2(28, 20),
    vec2(-28, 20)
  ]

  // Vertices for road and car
  verticesRoad = [
    vec2(-30,-6.0),
    vec2(30,-6.0),
    vec2(30,-10.0),
    vec2(-30,-10.0)
  ]

  //  Configure WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor( 0.0, 0.0, 0.0, 1.0 );        // Set background color of the viewport to black

  //  Load shaders and initialize attribute buffers
  program = initShaders( gl, "vertex-shader", "fragment-shader" ); // Compile and link shaders to form a program
  gl.useProgram(program);                                               // Make this the active shaer program

  aspect = canvas.width / canvas.height*1.5;                      // get the aspect ratio of the canvas
  left  *= aspect;                                            // left limit of world coords
  right *= aspect;                                            // right limit of world coords
  PMat = ortho(left, right, bottom, topBorder*2, near, far);    // Call function to compute orthographic projection matrix
  // Done setting View Transformation matrix

  render();
};

function DrawSun(degs, pivot) {
  // Initalize VBO1 for the Sun, load on GPU, and bind
  var vPositionLoc = gl.getAttribLocation(program, "vPosition");  // Link js vPosition with "vertex shader attribute variable" - vPosition
  var vbo = Vbo(gl, verticesSun, 2);
  vbo.BindToAttribute(vPositionLoc);      // Associate the shader attribute VPosition with the appropriate VBO and bind

  var P_loc = gl.getUniformLocation(program, "P");       // Get Vertex shader memory location for P
  gl.uniformMatrix4fv(P_loc, false, flatten(PMat));   // Set uniform variable P on GPU

  var MV_loc = gl.getUniformLocation(program, "MV");           // Get Vertex shader memory location for the MV matrix
  var colorLoc = gl.getUniformLocation(program, "color");      // Get fragment shader memory location of color


  var R1 = rotateZ(degs);
  var T = translate(pivot[0], pivot[1], pivot[2]);
  var R = mult(T, R1);

  scaleMat = scale(1.0, 1.0, 0.0);              // Set scale of object
  translateMat = translate(0.0,0.0, 0.0);       // Set location of object
  modelView = mult(translateMat, scaleMat);     // Compose the scale and the translate via matrix multiply storing the result in the modelView matrix
  modelView = mult(R1,mult(R, modelView));

  gl.uniformMatrix4fv(MV_loc, false, flatten(modelView));      // push values of modelView matrix down to the vertex shader uniform variable MV
  gl.uniform4f(colorLoc, 1.0, 1.0, 0.0, 1.0);               // Set RGB of frangment shader uniform variable "color" to yellow
  gl.drawArrays(gl.TRIANGLE_FAN, 0, n);                            // Invoke the render for the sun
}

function DrawShortRays(degs, pivot, rot) {
  var vPostionLoc2 = gl.getAttribLocation(program, "vPosition");
  var vbo2 = Vbo(gl, verticesShortRays, 2);
  vbo2.BindToAttribute(vPostionLoc2);

  var P_loc2 = gl.getUniformLocation(program, "P");
  gl.uniformMatrix4fv(P_loc2, false, flatten(PMat));

  var MV_loc2 = gl.getUniformLocation(program, "MV");
  var colorLoc2 = gl.getUniformLocation(program, "color");

  var R1 = rotateZ(degs);
  var R2 = rotateZ(rot);
  var T = translate(pivot[0], pivot[1],pivot[2]);
  var R = mult(R2, mult(T, R1));

  scaleMat = scale(1, 1, 0.0);
  translateMat = translate(1.5, 0.0, 0.0);
  modelView = mult(translateMat, scaleMat);
  modelView = mult(R, modelView);

  gl.uniformMatrix4fv(MV_loc2, false, flatten(modelView));
  gl.uniform4f(colorLoc2, 1.0, 1.0, 0.0, 1.0);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function DrawLongRays(degs, pivot, rot) {
  var vPostionLoc3 = gl.getAttribLocation(program, "vPosition");
  var vbo3 = Vbo(gl, verticesLongRays, 2);
  vbo3.BindToAttribute(vPostionLoc3);

  var P_loc3 = gl.getUniformLocation(program, "P");
  gl.uniformMatrix4fv(P_loc3, false, flatten(PMat));

  var MV_loc3 = gl.getUniformLocation(program, "MV");
  var colorLoc3 = gl.getUniformLocation(program, "color");

  var R1 = rotateZ(degs);
  var R2 = rotateZ(rot);
  var T = translate(pivot[0], pivot[1],pivot[2]);
  var R = mult(T, R1);

  scaleMat = scale(1, 1, 0.0);
  translateMat = translate(1.5, 0.0, 0.0);
  modelView = mult(translateMat, scaleMat);
  modelView = mult(R2, mult(R, modelView));

  gl.uniformMatrix4fv(MV_loc3, false, flatten(modelView));
  gl.uniform4f(colorLoc3, 1.0, 1.0, 0.0, 1.0);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function DrawMountain(trans) {
  // Initalize VBO1 for Hexagon, load on GPU, and bind
  var vPositionLoc4 = gl.getAttribLocation(program, "vPosition");
  var vbo4 = Vbo(gl, verticesMountains, 2);
  vbo4.BindToAttribute(vPositionLoc4);

  var P_loc4 = gl.getUniformLocation(program, "P");
  gl.uniformMatrix4fv(P_loc4, false, flatten(PMat));

  var MV_loc4 = gl.getUniformLocation(program, "MV");
  var colorLoc4 = gl.getUniformLocation(program, "color");

  var R = translate(trans[0], trans[1], trans[2]);

  scaleMat = scale(1.0, 1.0, 0.0);
  translateMat = translate(0.0, 0.0, 0.0);
  modelView = mult(translateMat, scaleMat);
  modelView = mult(R, modelView);

  gl.uniformMatrix4fv(MV_loc4, false, flatten(modelView));
  gl.uniform4f(colorLoc4, 0.0, 0.55, 0.0, 1.0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  scaleMat = scale(1.0, 1.0, 0.0);
  translateMat = translate(0.0, 0.0, 0.0);
  modelView = mult(translateMat, scaleMat);
  modelView = mult(R, modelView);

  gl.uniformMatrix4fv(MV_loc4, false, flatten(modelView));
  gl.uniform4f(colorLoc4, 0.0, 0.0, 0.0, 1.0);
  gl.drawArrays(gl.LINE_LOOP, 0, 3);
}

function DrawSky(backcolor) {

  var vPositionLoc5 = gl.getAttribLocation(program, "vPosition");
  var vbo5 = Vbo(gl, verticesSky, 2);
  vbo5.BindToAttribute(vPositionLoc5);

  var P_loc5 = gl.getUniformLocation(program, "P");
  gl.uniformMatrix4fv(P_loc5, false, flatten(PMat));

  var MV_loc5 = gl.getUniformLocation(program, "MV");
  var colorLoc5 = gl.getUniformLocation(program, "color");

  var R = translate(0, 0, 0);

  scaleMat = scale(1.0, 1.0, 0.0);
  translateMat = translate(0.0, 0.0, 0.0);
  modelView = mult(translateMat, scaleMat);
  modelView = mult(R, modelView);

  gl.uniformMatrix4fv(MV_loc5, false, flatten(modelView));
  gl.uniform4f(colorLoc5, backcolor[0], backcolor[1], backcolor[2], 1.0);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function DrawMoon(degs, pivot) {
  var vPositionLoc = gl.getAttribLocation(program, "vPosition");
  var vbo6 = Vbo(gl, verticesSun, 2);
  vbo6.BindToAttribute(vPositionLoc);

  var P_loc6 = gl.getUniformLocation(program, "P");
  gl.uniformMatrix4fv(P_loc6, false, flatten(PMat));

  var MV_loc6 = gl.getUniformLocation(program, "MV");
  var colorLoc6 = gl.getUniformLocation(program, "color");

  var R1 = rotateZ(degs);
  var T = translate(pivot[0], pivot[1], pivot[2]);
  var R = mult(T, R1);

  scaleMat = scale( 1.0, 1.0, 0.0);
  translateMat = translate( 0.0, 0.0, 0.0);
  modelView = mult(translateMat, scaleMat);
  modelView = mult(R1,mult(R, modelView));

  gl.uniformMatrix4fv(MV_loc6, false, flatten(modelView));
  gl.uniform4f(colorLoc6, 1.0, 1.0, 1.0, 1.0);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, n);

  scaleMat = scale( 0.2, 0.3, 0.0);
  translateMat = translate( 0.0, 0.5, 0.0);
  modelView = mult(translateMat, scaleMat);
  modelView = mult(R1,mult(R, modelView));

  gl.uniformMatrix4fv(MV_loc6, false, flatten(modelView));
  gl.uniform4f(colorLoc6, 0.2, 0.2, 0.2, 1.0);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, n);

  scaleMat = scale( 0.3, 0.25, 0.0);
  translateMat = translate( 0.62, 0.0, 0.0);
  modelView = mult(translateMat, scaleMat);
  modelView = mult(R1,mult(R, modelView));

  gl.uniformMatrix4fv(MV_loc6, false, flatten(modelView));
  gl.uniform4f(colorLoc6, 0.2, 0.2, 0.2, 1.0);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, n);

  scaleMat = scale( 0.22, 0.14, 0.0);
  translateMat = translate( -.45, -.62, 0.0);
  modelView = mult(translateMat, scaleMat);
  modelView = mult(R1,mult(R, modelView));

  gl.uniformMatrix4fv(MV_loc6, false, flatten(modelView));
  gl.uniform4f(colorLoc6, 0.2, 0.2, 0.2, 1.0);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
}

function DrawRoad() {

  var vPositionLoc7 = gl.getAttribLocation(program, "vPosition");
  var vbo7 = Vbo(gl, verticesRoad, 2);
  vbo7.BindToAttribute(vPositionLoc7);

  var P_loc7 = gl.getUniformLocation(program, "P");
  gl.uniformMatrix4fv(P_loc7, false, flatten(PMat));

  var MV_loc7 = gl.getUniformLocation(program, "MV");
  var colorLoc7 = gl.getUniformLocation(program, "color");

  var R = translate(0, 0, 0);

  scaleMat = scale(1.0, 1.0, 0.0);
  translateMat = translate(0.0, 0.0, 0.0);
  modelView = mult(translateMat, scaleMat);
  modelView = mult(R, modelView);

  gl.uniformMatrix4fv(MV_loc7, false, flatten(modelView));
  gl.uniform4f(colorLoc7, 0.1, 0.1, 0.1, 1.0);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

  scaleMat = scale(1.0, 0.05, 0.0);
  translateMat = translate(0.0,-7.5, 0.0);
  modelView = mult(translateMat, scaleMat);
  modelView = mult(R, modelView);

  gl.uniformMatrix4fv(MV_loc7, false, flatten(modelView));
  gl.uniform4f(colorLoc7, 1.0, 1.0, 0.0, 1.0);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function DrawCar(trans) {

  var vPositionLoc8 = gl.getAttribLocation(program, "vPosition");
  var vbo8 = Vbo(gl, verticesRoad, 2);
  vbo8.BindToAttribute(vPositionLoc8);

  var P_loc8 = gl.getUniformLocation(program, "P");
  gl.uniformMatrix4fv(P_loc8, false, flatten(PMat));

  var MV_loc8 = gl.getUniformLocation(program, "MV");
  var colorLoc8 = gl.getUniformLocation(program, "color");

  var R = translate(0, 0, 0);

  scaleMat = scale(0.1, 0.5, 0.0);
  translateMat = translate(trans, -3.5, 0.0);
  modelView = mult(translateMat, scaleMat);
  modelView = mult(R, modelView);

  gl.uniformMatrix4fv(MV_loc8, false, flatten(modelView));
  gl.uniform4f(colorLoc8, 1.0, 0.0, 0.0, 1.0);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

  scaleMat = scale(0.05, 0.25, 0.0);
  translateMat = translate(trans,-4.0, 0.0);
  modelView = mult(translateMat, scaleMat);
  modelView = mult(R, modelView);

  gl.uniformMatrix4fv(MV_loc8, false, flatten(modelView));
  gl.uniform4f(colorLoc8, 1.0, 0.0, 0.0, 1.0);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function DrawTires(degs, pivot) {

  var vPositionLoc9 = gl.getAttribLocation(program, "vPosition");
  var vbo9 = Vbo(gl, verticesSun, 2);
  vbo9.BindToAttribute(vPositionLoc9);

  var P_loc9 = gl.getUniformLocation(program, "P");
  gl.uniformMatrix4fv(P_loc9, false, flatten(PMat));

  var MV_loc9 = gl.getUniformLocation(program, "MV");
  var colorLoc9 = gl.getUniformLocation(program, "color");

  var R1 = rotateZ(degs);
  var T = translate(pivot[0], pivot[1], pivot[2]);
  var R = mult(T, R1);

  scaleMat = scale(0.5, 0.5, 0.0);
  translateMat = translate(0.0, 0.0, 0.0);
  modelView = mult(translateMat, scaleMat);
  modelView = mult(R, modelView);

  gl.uniformMatrix4fv(MV_loc9, false, flatten(modelView));
  gl.uniform4f(colorLoc9, 1.0, 1.0, 1.0, 1.0);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
}

function DrawHubs(degs, pivot) {
  var vPositionLoc10 = gl.getAttribLocation(program, "vPosition");
  var vbo10 = Vbo(gl, verticesHub, 2);
  vbo10.BindToAttribute(vPositionLoc10);

  var P_loc10 = gl.getUniformLocation(program, "P");
  gl.uniformMatrix4fv(P_loc10, false, flatten(PMat));

  var MV_loc10 = gl.getUniformLocation(program, "MV");
  var colorLoc10 = gl.getUniformLocation(program, "color");

  var R1 = rotateZ(degs);
  var T = translate(pivot[0], pivot[1], pivot[2]);
  var R = mult(T, R1);

  scaleMat = scale(0.75, 0.75, 0.0);
  translateMat = translate(0.0,0.0, 0.0);
  modelView = mult(translateMat, scaleMat);
  modelView = mult(R, modelView);

  gl.uniformMatrix4fv(MV_loc10, false, flatten(modelView));
  gl.uniform4f(colorLoc10, 1.0, 0.0, 0.0, 1.0);
  gl.drawArrays(gl.LINE_LOOP, 0, 3);
}

function DrawSnow(trans) {

  var vPositionLoc11 = gl.getAttribLocation(program, "vPosition");
  var vbo11 = Vbo(gl, verticesSnow, 2);
  vbo11.BindToAttribute(vPositionLoc11);

  var P_loc11 = gl.getUniformLocation(program, "P");
  gl.uniformMatrix4fv(P_loc11, false, flatten(PMat));

  var MV_loc11 = gl.getUniformLocation(program, "MV");
  var colorLoc11 = gl.getUniformLocation(program, "color");

  var R = translate(trans[0], trans[1], trans[2]);

  scaleMat = scale(1.0, 1.0, 0.0);
  translateMat = translate(0.0, 0.0, 0.0);
  modelView = mult(translateMat, scaleMat);
  modelView = mult(R, modelView);

  gl.uniformMatrix4fv(MV_loc11, false, flatten(modelView));
  gl.uniform4f(colorLoc11, 1.0, 1.0, 1.0, 1.0);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 7);
}

function render() {

  gl.clear(gl.COLOR_BUFFER_BIT);

  // Keep degrees under 360 for sky color function
  if (degs === 360) {
    degs = 0;
  } else {
    degs++;
  }

  // Need increased rotation speed to see  reverse spin
  rotRays += 2;

  // Move or reset position of car
  if (carX > 30.0) {
    carX = -30.0;
  } else {
    carX += .2;
  }

  // Find the proper color based on Sun whether the sun is up and Draw the Sky
  var rads = radians(degs);
  backcolor = getBackaground(rads);
  DrawSky(backcolor);

  // Draw the Moon
  DrawMoon(degs, vec3(-sunX, -sunY, 0.0));

  // Draw the Sun
  DrawSun(degs, vec3(sunX, sunY, 0.0));

  // Draw the rays
  DrawShortRays(-rotRays, vec3(sunX,sunY,0.0), degs);
  DrawShortRays(-rotRays-60, vec3(sunX,sunY,0.0), degs);
  DrawShortRays(-rotRays-120, vec3(sunX,sunY,0.0), degs);
  DrawShortRays(-rotRays-180, vec3(sunX,sunY,0.0), degs);
  DrawShortRays(-rotRays-240, vec3(sunX,sunY,0.0), degs);
  DrawShortRays(-rotRays-300, vec3(sunX,sunY,0.0), degs);
  DrawLongRays(degs+30,vec3(sunX,sunY,0.0), degs);
  DrawLongRays(degs+90,vec3(sunX,sunY,0.0), degs);
  DrawLongRays(degs+150,vec3(sunX,sunY,0.0), degs);
  DrawLongRays(degs+210,vec3(sunX,sunY,0.0), degs);
  DrawLongRays(degs+270,vec3(sunX,sunY,0.0), degs);
  DrawLongRays(degs+330,vec3(sunX,sunY,0.0), degs);

  // Draw the Mountains
  DrawMountain(vec3(2.0,7.0,0.0));
  DrawMountain(vec3(-12.0,4.0,0.0));
  DrawMountain(vec3(18.0,4.0,0.0));

  // Draw the Mountains
  DrawSnow(vec3(2.0,7.0,0.0));
  DrawSnow(vec3(-12.0,4.0,0.0));
  DrawSnow(vec3(18.0,4.0,0.0));

  // Draw the Road
  DrawRoad();

  // Draw the Car
  DrawCar(carX);
  DrawTires(degs,vec3(carX-1.5,-8.5,0.0));
  DrawTires(degs,vec3(carX+1.5,-8.5,0.0));
  DrawHubs(-rotRays, vec3(carX-1.5,-8.5,0.0));
  DrawHubs(-(rotRays+60), vec3(carX-1.5,-8.5,0.0));
  DrawHubs(-(rotRays+120), vec3(carX-1.5,-8.5,0.0));
  DrawHubs(-(rotRays+180), vec3(carX-1.5,-8.5,0.0));
  DrawHubs(-(rotRays+240), vec3(carX-1.5,-8.5,0.0));
  DrawHubs(-(rotRays+300), vec3(carX-1.5,-8.5,0.0));
  DrawHubs(-rotRays, vec3(carX+1.5,-8.5,0.0));
  DrawHubs(-(rotRays+60), vec3(carX+1.5,-8.5,0.0));
  DrawHubs(-(rotRays+120), vec3(carX+1.5,-8.5,0.0));
  DrawHubs(-(rotRays+180), vec3(carX+1.5,-8.5,0.0));
  DrawHubs(-(rotRays+240), vec3(carX+1.5,-8.5,0.0));
  DrawHubs(-(rotRays+300), vec3(carX+1.5,-8.5,0.0));

  requestAnimationFrame(render);                             // swap buffers, continue render loop
}

// Helper functions below
function DegsToRads (degree) {
  return degree * (Math.PI / 180)
}

function getBackaground(rad) {
  if (rad >= (11/12*Math.PI) && rad < (2*Math.PI)) backcolor = vec3(0.0,0.0,1.0);
  else backcolor = vec3(0.0,0.0,0.0);
  return backcolor;
}

function getDegree() {
  if (degs === 360) {
    degs = 0;
    return degs
  } else {
    degs++;
    return degs;
  }
}

