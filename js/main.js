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
// Model axes:
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
        
    document.getElementById('hit-direct').disabled = false;
    document.getElementById('hit-direct-long').disabled = false;
    document.getElementById('hit-direct-short').disabled = false;
    document.getElementById('hit-random').disabled = false;

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
    fielder.position = Fielder.rightField;

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
document.getElementById('hit-direct').onclick = function() {
  batter.hitDirect(ball, Batter.direct, fielder.position);
}

document.getElementById('hit-direct-long').onclick = function() {
  batter.hitDirect(ball, Batter.directLong, fielder.position);
}

document.getElementById('hit-direct-short').onclick = function() {
  batter.hitDirect(ball, Batter.directShort, fielder.position);
}

document.getElementById('hit-random').onclick = function() {
  batter.hit(ball, Batter.direct, fielder.position);
}

document.getElementById('cameras').addEventListener("change", cameraChanged);
document.getElementById('lookat').addEventListener("change", (event) => {
  camera.look = event.target.value;
});
document.getElementById('pause').addEventListener("change", (event) => {
  pauseSim = event.target.checked;
});

document.getElementById('sim-speed').addEventListener("change", (event) => {
  simSpeed = event.target.value;
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

