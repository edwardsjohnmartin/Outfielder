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

  init(geo) {
    this._geo = geo;
    this._inited = true;
    //    geo.scale.set(0.0762, 0.0762, 0.0762);  // 1 meter -> 3 inches diameter
    geo.scale.set(0.5, 0.5, 0.5);
  }

  reset() {
    this.position = new THREE.Vector3(0, 0.9144, 0);
    this._velocity = new THREE.Vector3(0, 0, 0);
  }

  hit(velocity) {
    this._velocity = velocity;
  }


  update(tickData) {
    if (this._geo.position.y < .1) {
      return;
    }
    const timeDelta = tickData.get("deltaTime");
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
