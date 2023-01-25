import * as THREE from './three.module.js';

export class Fielder {
  static get centerField() {return new THREE.Vector3(106.0, 0, 0);}
  static get cyclopianEyeHeight() {return new THREE.Vector3(0, 1.879, 0);}  // 6'2"

  constructor () {
    this._velocity = new THREE.Vector3(0, 0, 0);
    this._rotation = new THREE.Vector3(0, 0, 0);
    this._fileLocation = "assets/characters/lowpoly_dude.glb";
    this._inited = false;
  }

  get inited() {return this._inited;}
  get fileLocation() {return this._fileLocation;}
  get rotation() {return this._rotation;}
  get cyclopianEyePos() {
    return this.position.clone().add(Fielder.cyclopianEyeHeight);
  }

  get position() {
    if (this._geo) {
      return this._geo.position;
    }
    return null;
  }

  set position(pos) {
    if (this._geo) {
      this._geo.position.copy(pos);
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
