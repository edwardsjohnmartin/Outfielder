import * as THREE from './libs/three.module.js';
import {Outfielder} from './outfielder.js';
import {Pausable} from './pausable.js';

const gravity = new THREE.Vector3(0, -9.81, 0);

export class Ball extends Pausable {
  constructor () {
    super();
    this._fileLocation = "assets/baseball/scene.gltf";
    this._geo = null;
    this._inited = false;
    this._ballData = null;
    this._simSpeed = 1.0;
  }

  get inited() {return this._inited;}
  get fileLocation() {return this._fileLocation;}

  get position() {
    if (this._geo) {
      return this._geo.position;
    }
    return new THREE.Vector3(0, 0, 0);
  }

  set position(pos) {
    if (this._geo) {
      this._geo.position.copy(pos);
    }
  }

  init(geo) {
    this._geo = geo;
    this._inited = true;
    //    geo.scale.set(0.0762, 0.0762, 0.0762);  // 1 meter -> 3 inches diameter
    geo.scale.set(0.5, 0.5, 0.5);
  }

  reset() {
    this.position = new THREE.Vector3(0, 0.9144, 0); // 3 feet above home plate
  }

  hit(ballData) {
    this.startClock();
    this._ballData = ballData;
    this.reset();
  }

  update(tickData) {
    if (this.paused || !this._ballData) {
      return;
    }

    if (this.elapsedTime > this._ballData.tc) {
      this.stopClock();
      return;
    }
    const i = this.elapsedTime*100 | 0;
    this._geo.position.set(this._ballData.y[i]*0.3048, this._ballData.z[i]*0.3048, this._ballData.x[i]*0.3048);
    
    const timeDelta = tickData.get("deltaTime");
    this._geo.rotation.set(this._geo.rotation.x + timeDelta,
                           this._geo.rotation.y + timeDelta,
                           this._geo.rotation.z + timeDelta);
  }
}
