import * as THREE from './three.module.js';

export class Fielder {
  // This belongs in an environment data pipeline.
  static get centerField() {
    return new THREE.Vector3(106.0, 0, 0);
  }

  constructor () {
    this._velocity = new THREE.Vector3(0, 0, 0);
    this._rotation = new THREE.Vector3(0, 0, 0);
    this._fileLocation = "assets/characters/lowpoly_dude.glb";
    this._inited = false;
  }

  get inited() {return this._inited;}
  get fileLocation() {return this._fileLocation;}
  get rotation() {return this._rotation;}
  get cyclopianEyeHeight() {return 1.879;}  // 6'2"
  get cyclopianEyeLocation() {
    return new THREE.Vector3(this.position.x, this.position.y+this.cyclopianEyeHeight, this.position.z);
  }

  get position() {
    if (this._geo) {
      return this._geo.position;
    }
    return null;
  }

  set position(pos) {
    if (this._geo) {
      this._geo.position.set(pos.x, pos.y, pos.z);
    }
  }

  set lookAt(pos) {
    if (this._geo) {
      let v = pos.sub(this._geo.position);
      let angle = -pos.angleTo(new THREE.Vector3(1, pos.y, 0));
      this._geo.rotation.set(0, angle, 0);
    }
  }

  init(geo) {
    this._geo = geo;
    this._inited = true;
    this.lookAt = new THREE.Vector3(-1, 0, 0);
  }

  update(tickData) {
  }
}
