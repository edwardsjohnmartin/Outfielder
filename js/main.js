import * as THREE from './libs/three.module.js';
import {GLTFLoader} from './libs/GLTFLoader.js';
import {OrbitControls} from './libs/OrbitControls.js';
import {Ball} from './ball.js';
import {Fielder} from './fielder.js';
import {Batter} from './batter.js';
import {Camera} from './camera.js';
import {Diagram} from './diagram.js';

var scene, renderer, controls, clock, sceneInited;

var batter = new Batter();
var fielder = new Fielder();
var ball = new Ball();
var camera = new Camera();
var pauseSim = false;
var simSpeed = 1.0;
var diagram = new Diagram();
var ballData = null;

var canvas;
var canvasRect;
var canvasSize = new THREE.Vector2(600, 600);

//==============================
// Init
//
function init() {
  initScene();
  camera.init(canvasSize.x, canvasSize.y);
  cameraChanged();
  initRenderer();
  document.getElementById('hit').disabled = true;
  document.getElementById('randomize').disabled = true;

  canvas = document.getElementById('canvas-container');
  canvas.appendChild(renderer.domElement);
  getCanvasRect();

  diagram.init(scene);
  initControls();
  clock = new THREE.Clock();
}

function initControls() {
  controls = new OrbitControls(camera.renderCamera, renderer.domElement);
  controls.enableDamping = true;
}

//-----------------------------
// Origin:
//  Home plate
// Environment Axes:
//  x: toward second base
//  y: up
//  z: right
//
// Boyd's axes:
//  x: right
//  y: toward second base
//  z: up
function initScene() {
  // Local to the function.
  var envInited = false;
  sceneInited = false;

  scene = new THREE.Scene();
  
  // Environment
  const loader = new GLTFLoader();
  loader.load('assets/baseball_field/Baseball_Field.gltf', function(gltf) {
    gltf.scene.rotation.set(0, 3.1415, 0); // Rotate so +x is toward outfield
    gltf.scene.position.set(18.4, 0, 0);  // Set at home plate as origin.
    scene.add(gltf.scene);
    envInited = true;
    if (envInited && ball.inited && fielder.inited) {
      sceneInited = true;
    }
  }, undefined, function(error) {
    console.error(error);
  });

  // Ball
  loader.load(ball.fileLocation, function(gltf) {
    scene.add(gltf.scene);
    ball.init(gltf.scene);
        
    document.getElementById('hit').disabled = false;
//    document.getElementById('randomize').disabled = false;

    if (envInited && ball.inited && fielder.inited) {
      sceneInited = true;
    }
  }, undefined, function(error) {
    console.error(error);
  });


  // fielder
  loader.load(fielder.fileLocation, function(gltf) {
    scene.add(gltf.scene);
    fielder.init(gltf.scene);
    setFielderPos(false);

    if (envInited && ball.inited && fielder.inited) {
      sceneInited = true;
    }
  }, undefined, function(error) {
    console.error(error);
  });

// AxesHelper
//  scene.add(new THREE.AxesHelper(5));

  initSkybox();
  initLights();
}

function initSkybox() {
  const which = "assets/skybox/sh_";
  const ext = ".png";
  const loader = new THREE.CubeTextureLoader();
  const texture = loader.load([which+"ft" + ext,
                               which+"bk" + ext,
                               which+"up" + ext,
                               which+"dn" + ext,
                               which+"rt" + ext,
                               which+"lf" + ext]);
  scene.background = texture;
}

function initLights() {
  const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
  scene.add(sunLight);
  const ambientLight = new THREE.AmbientLight(0xe0e0e0, 1.0);
  scene.add(ambientLight);
}

function initRenderer() {
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(canvasSize.x, canvasSize.y);
}

function getFrustum(camera) {
  var frustum = new THREE.Frustum();
  frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.renderCamera.projectionMatrix,
                                                                       camera.renderCamera.matrixWorldInverse));
  return frustum;
}

//=============================
//  Tick
//
function render() {
  const tickData = new Map();
  requestAnimationFrame(render);
  tickData.set("deltaTime", clock.getDelta() * simSpeed);
  tickData.set("fielder", fielder);
  tickData.set("ball", ball);
  tickData.set("camera", camera);
  tickData.set("canvasRect", canvasRect);
  tickData.set("controls", controls);
  
  if (sceneInited) {
    // Sim elements
    if (!pauseSim) {
      ball.update(tickData);
    }

    // Controls/Camera
    camera.update(tickData);
    controls.update();

//    if (followCam) {
//      controls.target = ball.position.clone();
//    }

    // Visualization (need latest camera)
    tickData.set("frustum", getFrustum(camera));  // All labels need this.
    fielder.update(tickData);
    diagram.update(tickData);
    realtimeData();
  }
  renderer.render(scene, camera.renderCamera);
}

//=============================
//  Main
//
init();
render();

//sandbox();

//=============================
//  Sandbox to play in!
//
function sandbox() {
  var v1 = new THREE.Vector3(1, 0, 0);
  var v2 = new THREE.Vector3(0, 1, 0);
  var v3 = new THREE.Vector3(-1, 0, 0);
  var v4 = new THREE.Vector3(0, -1, 0);
  var v5 = new THREE.Vector3(1, 1, 0);
  var v6 = new THREE.Vector3(-1, 1, 0);
  var v7 = new THREE.Vector3(-1, -1, 0);
  var v8 = new THREE.Vector3(1, -1, 0);

  console.log(v1.angleTo(v1));
  console.log(v1.angleTo(v2));
  console.log(v1.angleTo(v3));
  console.log(v1.angleTo(v4));
  console.log(v1.angleTo(v5));
  console.log(v1.angleTo(v6));
  console.log(v1.angleTo(v7));
  console.log(v1.angleTo(v8));
}

//==============================
// Listeners
//
document.getElementById('hit').onclick = function() {
  var hitData = {};
  setFielderPos(false);
  hitData.exitSpeed = parseInt(document.getElementById('exit-speed').value); // mph
  hitData.theta = parseInt(document.getElementById('exit-theta').value); // degrees
  hitData.phi = parseInt(document.getElementById('exit-phi').value); // degrees
  hitData.handedness = parseInt(document.getElementById('handedness').value);
  hitData.fielderX = fielder.position.z * 3.281;
  hitData.fielderY = fielder.position.x * 3.281;
  hitData.motion = parseInt(document.getElementById('motion').value);
  batter.hit(ball, fielder, diagram, hitData);
}

document.getElementById('randomize').onclick = function() {
}

document.getElementById('cameras').addEventListener("change", cameraChanged);
document.getElementById('lookat').addEventListener("change", (event) => {
  camera.look = event.target.value;
});
document.getElementById('pause').addEventListener("change", (event) => {
  pauseSim = event.target.checked;
  ball.pause(pauseSim);
  diagram.pause(pauseSim);
  fielder.pause(pauseSim);
});

document.getElementById('sim-speed').addEventListener("change", (event) => {
  simSpeed = event.target.value;
  ball.simSpeed = simSpeed;
});
window.addEventListener('resize', getCanvasRect);
window.addEventListener('scroll', getCanvasRect);

function cameraChanged(event) {
  var val;
  if (event) {
    val = event.target.value;
  }
  else {
    val = document.getElementById('cameras').value;
  }
  camera.which = parseInt(val);
}

function getCanvasRect() {
  canvasRect = canvas.getBoundingClientRect();
}

document.getElementById('fielder-y').addEventListener("change", (event) => {setFielderPos(true);})
document.getElementById('fielder-x').addEventListener("change", (event) => {setFielderPos(true);})
function setFielderPos(reset) {
  if (reset) {
    diagram.reset();
    ball.reset();
  }
  fielder.position = new THREE.Vector3(document.getElementById('fielder-y').value / 3.281,
                                       0,
                                       document.getElementById('fielder-x').value / 3.281);
}

function realtimeData() {
  document.getElementById('rt-fielder-x').innerHTML = (fielder.position.z * 3.281) | 0;
  document.getElementById('rt-fielder-y').innerHTML = (fielder.position.x * 3.281) | 0;

  document.getElementById('rt-ball-x').innerHTML = (ball.position.z * 3.281) | 0;
  document.getElementById('rt-ball-y').innerHTML = (ball.position.x * 3.281) | 0;
  document.getElementById('rt-ball-z').innerHTML = (ball.position.y * 3.281) | 0;

  if (ball.flightTime > 0) {
    document.getElementById('rt-time').innerHTML = ball.flightTime.toFixed(2);
  }
}
