import * as THREE from './three.module.js';

const gravity = new THREE.Vector3(0, -9.81, 0);

export class Ball {
  constructor () {
    this._fileLocation = "assets/baseball/scene.gltf";
    this._geo = null;
    this._inited = false;
    this._velocity = new THREE.Vector3(0, 0, 0);
  }

  get inited() {
    return this._inited;
  }

  get fileLocation() {
    return this._fileLocation;
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

  set rotation(rotate) {
    this._geo.position.set(pos.x, pos.y, pos.z);
  }

  init(geo) {
    this._geo = geo;
    this._inited = true;
    this._velocity = new THREE.Vector3(2, 2, 0);
  }

  reset(velocity) {
    this.position = new THREE.Vector3(0, 0.9144, 0);
    this._velocity = velocity;
  }

  update(timeDelta) {
    if (this._geo.position.y < .1) {
      return;
    }
    this._velocity.set(this._velocity.x,
                       this._velocity.y + gravity.y * timeDelta,
                       this._velocity.z);
    this._geo.position.set(this.position.x + this._velocity.x * timeDelta,
                           this.position.y + this._velocity.y * timeDelta,
                           this.position.z + this._velocity.z * timeDelta)

    this._geo.rotation.set(this._geo.rotation.x + this._velocity.x * timeDelta,
                           this._geo.rotation.y + this._velocity.y * timeDelta,
                           this._geo.rotation.z + this._velocity.z * timeDelta)
  }
}
