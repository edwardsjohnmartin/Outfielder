import * as THREE from './three.module.js';
import {GLTFLoader} from './GLTFLoader.js';
import {OrbitControls} from './OrbitControls.js';

var scene, camera, renderer, controls;

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
}

function initControls() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
}

function initScene() {
  // Geometry
  const loader = new GLTFLoader();
  loader.load('assets/baseball_field/Baseball_Field.gltf', function(gltf) {
    scene.add(gltf.scene);
  }, undefined, function(error) {
    console.error(error);
  });
  
  // AxesHelper
  scene.add(new THREE.AxesHelper(5));
}

function initLights() {
  const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
  scene.add(sunLight);
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
  renderer.render(scene, camera);
}

init();
render();
