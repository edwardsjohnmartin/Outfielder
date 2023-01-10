import * as THREE from './three.module.js';

export class Fielder {
  constructor () {
    this._velocity = new THREE.Vector3(0, 0, 0);
    this._position = new THREE.Vector3(0, 0, 0);
    this._rotation = new THREE.Vector3(0, 0, 0);
  }

  get position() {
    return this._position;
  }

  set position(pos) {
    this._position.set(pos.x, pos.y, pos.z);
  }

  get rotation() {
    return this._rotation;
  }
  
  set rotation(rotate) {
    this._rotation.set(pos.x, pos.y, pos.z);
  }

  update(timeDelta) {
  }
}
