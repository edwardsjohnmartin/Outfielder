import * as THREE from './three.module.js';
import {Line} from './line.js';

export class Diagram {
  constructor () {
    this._r = new Line();
  }
  
  init(scene) {
    this._r.init(scene, new THREE.Vector3(0, 0, 0), new THREE.Vector3(2, 5, 5));

    this.debugLines(scene);
  }
  
  update(ballPos, fielderPos) {
    this._r.update(new THREE.Vector3(0, 0, 0), ballPos);
  }

  debugLines(scene) {
    var depth = new Line();
    depth.init(scene, new THREE.Vector3(0, 1, 0), new THREE.Vector3(121, 1, 0));
  }
}
