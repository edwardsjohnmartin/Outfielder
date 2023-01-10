import * as THREE from './three.module.js';
import {GLTFLoader} from './GLTFLoader.js';
import {OrbitControls} from './OrbitControls.js';
import {Ball} from './ball.js';
import {Fielder} from './fielder.js';
import {Batter} from './batter.js';

var scene, camera, renderer, controls, clock;

var batter = new Batter();
var fielder = new Fielder();
var ball = new Ball();

var WIDTH  = 400;//window.innerWidth;
var HEIGHT = 400;//window.innerHeight;

var SPEED = 0.01;

function init() {
  scene = new THREE.Scene();

  initScene();
  initLights();    
  initCamera();
  initRenderer();

  let canvas = document.getElementById('canvas-container');
  canvas.appendChild(renderer.domElement);

  initControls();
  clock = new THREE.Clock();

  fielder.position = new THREE.Vector3(106.0, 1.82, 0);
  camera.position.set(fielder.position.x, fielder.position.y, fielder.position.z);
}

function initControls() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
}

function initScene() {
  // Environment
  const loader = new GLTFLoader();
  loader.load('assets/baseball_field/Baseball_Field.gltf', function(gltf) {
    gltf.scene.rotation.set(0, 3.1415, 0); // Rotate so +z is toward outfield
    gltf.scene.position.set(18.4, 0, 0);  // Set at home plate as origin.
    scene.add(gltf.scene);
  }, undefined, function(error) {
    console.error(error);
  });

  // Ball
  loader.load(ball.fileLocation, function(gltf) {
    scene.add(gltf.scene);
    ball.init(gltf.scene);
    batter.hit(ball);
  }, undefined, function(error) {
    console.error(error);
  });

  // AxesHelper
  scene.add(new THREE.AxesHelper(5));
}

function initLights() {
  const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
  scene.add(sunLight);
  const ambientLight = new THREE.AmbientLight(0xe0e0e0, 1.0);
  scene.add(ambientLight);
}

function initCamera() {
  camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 1000);
  camera.position.set(0, 3.5, 5);
  camera.lookAt(scene.position);
}

function initRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(WIDTH, HEIGHT);
}

function render() {
  requestAnimationFrame(render);
  controls.update();
  if (ball.inited) {
    ball.update(clock.getDelta());
    camera.lookAt(ball.position);
  }
  fielder.update(clock.getDelta());
  renderer.render(scene, camera);
}

init();
render();
