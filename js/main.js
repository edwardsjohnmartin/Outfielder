import * as THREE from './three.module.js';
import {GLTFLoader} from './GLTFLoader.js';
import {OrbitControls} from './OrbitControls.js';
import {Ball} from './ball.js';
import {Fielder} from './fielder.js';
import {Batter} from './batter.js';
import {Camera} from './camera.js';

var scene, renderer, controls, clock, sceneInited;

var batter = new Batter();
var fielder = new Fielder();
var ball = new Ball();
var camera = new Camera();

var WIDTH  = 600;//window.innerWidth;
var HEIGHT = 600;//window.innerHeight;

var SPEED = 0.01;

function init() {
  initScene();
  camera.init(WIDTH, HEIGHT);
  cameraChanged();
  initRenderer();

  let canvas = document.getElementById('canvas-container');
  canvas.appendChild(renderer.domElement);

  initControls();
  clock = new THREE.Clock();
  fielder.position = Fielder.centerField;
}

function cameraChanged() {
  ball.reset();
  camera.which = parseInt(document.getElementById('cameras').value);
}

function initControls() {
  controls = new OrbitControls(camera.renderCamera, renderer.domElement);
  controls.enableDamping = true;
}

function initScene() {
  // Local to the function.
  var envInited = false;
  var ballInited = false;
  sceneInited = false;

  scene = new THREE.Scene();
  
  // Environment
  const loader = new GLTFLoader();
  loader.load('assets/baseball_field/Baseball_Field.gltf', function(gltf) {
    gltf.scene.rotation.set(0, 3.1415, 0); // Rotate so +z is toward outfield
    gltf.scene.position.set(18.4, 0, 0);  // Set at home plate as origin.
    scene.add(gltf.scene);
    envInited = true;
    if (envInited && ballInited) {
      sceneInited = true;
    }
  }, undefined, function(error) {
    console.error(error);
  });

  // Ball
  loader.load(ball.fileLocation, function(gltf) {
    scene.add(gltf.scene);
    ball.init(gltf.scene);
    
//    var bbox = new THREE.Box3().setFromObject(gltf.scene);
//    console.log(bbox);
    document.getElementById('hit-direct').disabled = false;
    document.getElementById('hit-direct-long').disabled = false;
    document.getElementById('hit-direct-short').disabled = false;
    document.getElementById('hit-random').disabled = false;

    ballInited = true;
    if (envInited && ballInited) {
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
  renderer.setSize(WIDTH, HEIGHT);
}

function render() {
  requestAnimationFrame(render);
  if (sceneInited) {
    controls.update();
    ball.update(clock.getDelta());
    fielder.update(clock.getDelta());
    camera.update(ball.position, fielder.position);
  }
  renderer.render(scene, camera.renderCamera);
}

init();
render();


//==============================
// Inputs
document.getElementById('hit-direct').onclick = function() {
  batter.hitDirect(ball, Batter.direct, fielder.position);
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
