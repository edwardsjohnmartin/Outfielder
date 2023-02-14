import * as THREE from './libs/three.module.js';
import {Outfielder} from './outfielder.js';

const gravity = new THREE.Vector3(0, -9.81, 0);

export class Ball {
  constructor () {
    this._fileLocation = "assets/baseball/scene.gltf";
    this._geo = null;
    this._inited = false;
    this._ballData = null;
    this._clock = null;
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

  hit(velocity) {
    this.reset();
    this._ballData = Outfielder();
    this._clock = new THREE.Clock();
    console.log(this._ballData);
  }

  update(tickData) {
    if (!this._clock) {
      return;
    }

//    this._velocity.add(gravity.clone().multiplyScalar(timeDelta));
    //    this._geo.position.add(this._velocity.clone().multiplyScalar(timeDelta));
    const elapsedTime = this._clock.getElapsedTime();
    const i = elapsedTime*100 | 0;
    
    if (elapsedTime > this._ballData.tc) {
      this._clock = null;
      return;
    }
    this._geo.position.set(this._ballData.y[i]*0.3048, this._ballData.z[i]*0.3048, this._ballData.x[i]*0.3048);
    
    const timeDelta = tickData.get("deltaTime");
    this._geo.rotation.set(this._geo.rotation.x + timeDelta,
                           this._geo.rotation.y + timeDelta,
                           this._geo.rotation.z + timeDelta);
  }
}
