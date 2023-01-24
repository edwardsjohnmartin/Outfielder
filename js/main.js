import * as THREE from './three.module.js';
import {GLTFLoader} from './GLTFLoader.js';
import {OrbitControls} from './OrbitControls.js';
import {Ball} from './ball.js';
import {Fielder} from './fielder.js';
import {Batter} from './batter.js';
import {Camera} from './camera.js';
import {Label} from './label.js';

var scene, renderer, controls, clock, sceneInited;

var batter = new Batter();
var fielder = new Fielder();
var ball = new Ball();
var camera = new Camera();
var pauseSim = false;
var simSpeed = 1.0;
var label = new Label();

var canvas;
var canvasRect;
var canvasSize = new THREE.Vector2(600, 600);

var SPEED = 0.01;

function init() {
  initScene();
  camera.init(canvasSize.x, canvasSize.y);
  cameraChanged();
  initRenderer();

  canvas = document.getElementById('canvas-container');
  canvas.appendChild(renderer.domElement);
  getCanvasRect();

  initControls();
  clock = new THREE.Clock();
  fielder.position = Fielder.centerField;
}

function cameraChanged() {
  ball.reset();
  camera.which = parseInt(document.getElementById('cameras').value);
}

function getCanvasRect() {
  canvasRect = canvas.getBoundingClientRect();
}

function initControls() {
  controls = new OrbitControls(camera.renderCamera, renderer.domElement);
  controls.enableDamping = true;
}

//-----------------------------
// Axes:
//  x: toward center field
//  y: up
//  z: right
// Origin:
//  Home plate
//
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
//    label.init(gltf.scene);
        
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

    label.init(gltf.scene); // Label for the fielder
    
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
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(canvasSize.x, canvasSize.y);
}

function render() {
  requestAnimationFrame(render);
  var deltaTime = clock.getDelta() * simSpeed;
  if (sceneInited) {
    if (!pauseSim) {
      ball.update(deltaTime);
    }
    fielder.update(deltaTime);
    controls.target = ball.position
    controls.update();
    camera.update(ball.position, fielder.position);
    label.update(camera, canvasRect);
  }
  renderer.render(scene, camera.renderCamera);
}

init();
render();


//==============================
// Inputs
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
