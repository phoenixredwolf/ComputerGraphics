// Set global Variables
var gl;
var program;
var aspect;
var degs = 0;
var rotRays = 0;
var sunX = -18;
var sunY = -5.0;
var verticesSun;
var verticesShortRays;
var verticesLongRays;
var verticesMountains;
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

  // Ferris Wheel Structure vertices
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

  // Ferris Wheel Cars
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

  // Mountain vertices
  verticesMountains = [
    vec2( -35.0,-20.0),
    vec2( -3, 3.0),
    vec2( 30, -20)
  ]

  verticesSky = [
    vec2(-28,-10),
    vec2(28, -10),
    vec2(28, 20),
    vec2(-28, 20)
  ]


  //  Configure WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor( 0.0, 0.0, 0.0, 1.0 );        // Set background color of the viewport to black

  //  Load shaders and initialize attribute buffers
  program = initShaders( gl, "vertex-shader", "fragment-shader" ); // Compile and link shaders to form a program
  program2 = initShaders( gl, "vertex-shader", "fragment-shader" );
  program3 = initShaders( gl, "vertex-shader", "fragment-shader" );
  program4 = initShaders( gl, "vertex-shader", "fragment-shader" );
  program5 = initShaders( gl, "vertex-shader", "fragment-shader" );

  aspect = canvas.width / canvas.height*1.5;                      // get the aspect ratio of the canvas
  left  *= aspect;                                            // left limit of world coords
  right *= aspect;                                            // right limit of world coords
  PMat = ortho(left, right, bottom, topBorder*2, near, far);    // Call function to compute orthographic projection matrix
  // Done setting View Transformation matrix

  render();
};

function DrawMoon(degs, pivot)
{
  gl.useProgram(program5);                                               // Make this the active shaer program
  // Initalize VBO1 for Hexagon, load on GPU, and bind
  var vPositionLoc = gl.getAttribLocation(program5, "vPosition");  // Link js vPosition with "vertex shader attribute variable" - vPosition
  var vbo6 = Vbo(gl, verticesSun, 2);
  vbo6.BindToAttribute(vPositionLoc);      // Associate the shader attribute VPosition with the appropriate VBO and bind

  var P_loc6 = gl.getUniformLocation(program5, "P");       // Get Vertex shader memory location for P
  gl.uniformMatrix4fv(P_loc6, false, flatten(PMat));   // Set uniform variable P on GPU

  var MV_loc6 = gl.getUniformLocation(program5, "MV");           // Get Vertex shader memory location for the MV matrix
  var colorLoc6 = gl.getUniformLocation(program5, "color");      // Get fragment shader memory location of color


  var R1 = rotateZ(degs);
  var T = translate(pivot[0], pivot[1], pivot[2]);
  var R = mult(T, R1);

  scaleMat = scale(1.0, 1.0, 0.0);               // Scale unit square in x-direction by 5.0 to form a 5x1 rectangle
  translateMat = translate(0.0,0.0, 0.0);       // Translate the 5x1 rectangle down -2.0 in the y direction
  modelView = mult(translateMat, scaleMat);      // Compose the scale and the translate via matrix multiply storing the result in the modelView matrix
  modelView = mult(R1,mult(R, modelView));

  gl.uniformMatrix4fv(MV_loc6, false, flatten(modelView));      // push values of modelView matrix down to the vertex shader uniform variable MV
  gl.uniform4f(colorLoc6, 1.0, 1.0, 1.0, 1.0);               // Set RGB of frangment shader uniform variable "color" to yellow
  gl.drawArrays(gl.TRIANGLE_FAN, 0, n);                         // Invoke the render of the mouth rectangle
}

function DrawSun(degs, pivot)
{
  gl.useProgram(program);                                               // Make this the active shaer program
  // Initalize VBO1 for Hexagon, load on GPU, and bind
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

  scaleMat = scale(1.0, 1.0, 0.0);               // Scale unit square in x-direction by 5.0 to form a 5x1 rectangle
  translateMat = translate(0.0,0.0, 0.0);       // Translate the 5x1 rectangle down -2.0 in the y direction
  modelView = mult(translateMat, scaleMat);      // Compose the scale and the translate via matrix multiply storing the result in the modelView matrix
  modelView = mult(R1,mult(R, modelView));

  gl.uniformMatrix4fv(MV_loc, false, flatten(modelView));      // push values of modelView matrix down to the vertex shader uniform variable MV
  gl.uniform4f(colorLoc, 1.0, 1.0, 0.0, 1.0);               // Set RGB of frangment shader uniform variable "color" to yellow
  gl.drawArrays(gl.TRIANGLE_FAN, 0, n);                         // Invoke the render of the mouth rectangle
}

function DrawShortRays(degs, pivot, rot)
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

function DrawLongRays(degs, pivot, rot)
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

function DrawMountain(trans)
{
  gl.useProgram(program3);                                               // Make this the active shaer program
  // Initalize VBO1 for Hexagon, load on GPU, and bind
  var vPositionLoc4 = gl.getAttribLocation(program3, "vPosition");  // Link js vPosition with "vertex shader attribute variable" - vPosition
  var vbo4 = Vbo(gl, verticesMountains, 2);
  vbo4.BindToAttribute(vPositionLoc4);      // Associate the shader attribute VPosition with the appropriate VBO and bind

  var P_loc4 = gl.getUniformLocation(program3, "P");       // Get Vertex shader memory location for P
  gl.uniformMatrix4fv(P_loc4, false, flatten(PMat));   // Set uniform variable P on GPU

  var MV_loc4 = gl.getUniformLocation(program3, "MV");           // Get Vertex shader memory location for the MV matrix
  var colorLoc4 = gl.getUniformLocation(program3, "color");      // Get fragment shader memory location of color

  var R = translate(trans[0], trans[1], trans[2]);

  scaleMat = scale(1.0, 1.0, 0.0);               // Scale unit square in x-direction by 5.0 to form a 5x1 rectangle
  translateMat = translate(0.0, 0.0, 0.0);       // Translate the 5x1 rectangle down -2.0 in the y direction
  modelView = mult(translateMat, scaleMat);      // Compose the scale and the translate via matrix multiply storing the result in the modelView matrix
  modelView = mult(R, modelView);

  gl.uniformMatrix4fv(MV_loc4, false, flatten(modelView));      // push values of modelView matrix down to the vertex shader uniform variable MV
  gl.uniform4f(colorLoc4, 0.0, 0.55, 0.0, 1.0);               // Set RGB of frangment shader uniform variable "color" to yellow
  gl.drawArrays(gl.TRIANGLES, 0, 3);                         // Invoke the render of the mouth rectangle
}

function DrawSky(backcolor)
{
  console.log(sunY)
  console.log(backcolor[0]+ " " + backcolor[1] + " " + backcolor[2])
  gl.useProgram(program4);                                               // Make this the active shaer program
  // Initalize VBO1 for Hexagon, load on GPU, and bind
  var vPositionLoc5 = gl.getAttribLocation(program4, "vPosition");  // Link js vPosition with "vertex shader attribute variable" - vPosition
  var vbo5 = Vbo(gl, verticesSky, 2);
  vbo5.BindToAttribute(vPositionLoc5);      // Associate the shader attribute VPosition with the appropriate VBO and bind

  var P_loc5 = gl.getUniformLocation(program4, "P");       // Get Vertex shader memory location for P
  gl.uniformMatrix4fv(P_loc5, false, flatten(PMat));   // Set uniform variable P on GPU

  var MV_loc5 = gl.getUniformLocation(program4, "MV");           // Get Vertex shader memory location for the MV matrix
  var colorLoc5 = gl.getUniformLocation(program4, "color");      // Get fragment shader memory location of color

  var R = translate(0, 0, 0);

  scaleMat = scale(1.0, 1.0, 0.0);               // Scale unit square in x-direction by 5.0 to form a 5x1 rectangle
  translateMat = translate(0.0, 0.0, 0.0);       // Translate the 5x1 rectangle down -2.0 in the y direction
  modelView = mult(translateMat, scaleMat);      // Compose the scale and the translate via matrix multiply storing the result in the modelView matrix
  modelView = mult(R, modelView);

  gl.uniformMatrix4fv(MV_loc5, false, flatten(modelView));      // push values of modelView matrix down to the vertex shader uniform variable MV
  gl.uniform4f(colorLoc5, backcolor[0], backcolor[1], backcolor[2], 1.0);               // Set RGB of frangment shader uniform variable "color" to yellow
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);                         // Invoke the render of the mouth rectangle
}

function render() {

                               // Clear the canvas with gl.clearColor defined above

  //getBackaground();

  gl.clear(gl.COLOR_BUFFER_BIT);

  if (degs === 360) {
    degs = 0;
  } else {
    degs++;
  }
  console.log(degs)
  var rads = radians(degs)
  rotRays += 2;

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



  DrawMountain(vec3(0.0,5.0,0.0));
  DrawMountain(vec3(-10.0,3.0,0.0));
  DrawMountain(vec3(20.0,2.0,0.0));

  requestAnimationFrame(render);                             // swap buffers, continue render loop
}

function DegsToRads (degree) {
  var rad = degree * (Math.PI / 180);
  return rad
}

function getX() {
  if (sunX > -25.0) sunX -= 0.1;
  else sunX = 25.0;
  return sunX
}

function getY() {
  if (sunX < -1.0) sunY -= 0.07;
  else if (sunX >= -1.0 && sunX <= 1.0 ) sunY = 6.99;
  else sunY += 0.07;
  return sunY
}

function getBackaground(rad) {
  if (rad >= (11/12*Math.PI) && rad < (2*Math.PI)) backcolor = vec3(0.0,0.0,1.0);
  else backcolor = vec3(0.0,0.0,0.0);
  return backcolor;
}

function getDegree() {
  if (degs == 360) {
    degs = 0;
    return degs
  } else {
    degs++;
    return degs;
  }
}

