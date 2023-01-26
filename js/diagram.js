import * as THREE from './three.module.js';
import {Line} from './line.js';

export class Diagram {
  constructor () {
    this._r = new Line();
    this._rPrime = new Line();
    this._R = new Line();
  }
  
  init(scene) {
    this._r.init(scene, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), "r");
    this._rPrime.init(scene, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), "r'");
    this._R.init(scene, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), "R");

//    this.debugLines(scene);
  }
  
  update(tickData) {
    this._r.update(new THREE.Vector3(0, 0, 0), tickData.get("ball").position, tickData);
    this._rPrime.update(tickData.get("ball").position, tickData.get("fielder").cyclopianEyePos, tickData);
    this._R.update(new THREE.Vector3(0, 0, 0), tickData.get("fielder").cyclopianEyePos, tickData);
  }

  debugLines(scene) {
    // Distance of the center field fence (400 ft)
    var depth = new Line();
    depth.init(scene, new THREE.Vector3(0, 1, 0), new THREE.Vector3(121, 1, 0));
  }
}
