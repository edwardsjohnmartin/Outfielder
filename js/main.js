import * as THREE from './three.module.js';
import {GLTFLoader} from './GLTFLoader.js';
import {OrbitControls} from './OrbitControls.js';
import {Ball} from './ball.js';
import {Fielder} from './fielder.js';
import {Batter} from './batter.js';
import {Camera} from './camera.js';
import {Label} from './label.js';
import {Diagram} from './diagram.js';

var scene, renderer, controls, clock, sceneInited;

var batter = new Batter();
var fielder = new Fielder();
var ball = new Ball();
var camera = new Camera();
var pauseSim = false;
var simSpeed = 1.0;
var label = new Label();
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
    fielder.position = Fielder.centerField;

    label.initWithAnchor(gltf.scene, "Hoopdy"); // Label for the fielder
    
    if (envInited && ball.inited && fielder.inited) {
      sceneInited = true;
    }
  }, undefined, function(error) {
    console.error(error);
  });

// AxesHelper
  scene.add(new THREE.AxesHelper(5));

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
  
  if (sceneInited) {
    // Sim elements
    if (!pauseSim) {
      ball.update(tickData);
    }
    fielder.update(tickData);

    // Controls/Camera
    controls.target = ball.position
    controls.update();
    camera.update(tickData);

    // Visualization (need latest camera)
    tickData.set("frustum", getFrustum(camera));  // All labels need this.
    label.update(tickData);
    diagram.update(tickData);
  }
  renderer.render(scene, camera.renderCamera);
}

//=============================
//  Main
//
init();
render();


//==============================
// Listeners
//
document.getElementById('hit-direct').onclick = function() {
  batter.hitDirect(ball, Batter.direct, fielder.position);
  label.release();
}

document.getElementById('hit-direct-long').onclick = function() {
  batter.hitDirect(ball, Batter.directLong);
}

document.getElementById('hit-direct-short').onclick = function() {
  batter.hitDirect(ball, Batter.directShort);
}

document.getElementById('hit-random').onclick = function() {
  batter.hit(ball);
}

document.getElementById('cameras').addEventListener("change", cameraChanged);
document.getElementById('pause').addEventListener("change", (event) => {
  pauseSim = document.getElementById('pause').checked;
});
document.getElementById('sim-speed').addEventListener("change", (event) => {
  simSpeed = document.getElementById('sim-speed').value;
});
window.addEventListener('resize', getCanvasRect);
window.addEventListener('scroll', getCanvasRect);

function cameraChanged() {
  ball.reset();
  camera.which = parseInt(document.getElementById('cameras').value);
}

function getCanvasRect() {
  canvasRect = canvas.getBoundingClientRect();
}

