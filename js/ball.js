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
    this._elapsedTime = 0;
    this._pause = false;
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

  set pause(p) {
    this._pause = p;
    if (!this._clock) { // Not running a ball sim.
      return;
    }
    
    if (p) {
      this._elapsedTime = this._elapsedTime + this._clock.getElapsedTime();
      this._clock.stop();
    }
    else {
      this._clock.start();
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
    this._elapsedTime = 0;
    console.log(this._ballData);
  }

  update(tickData) {
    if (!this._clock) {
      return;
    }

    const et = this._clock.getElapsedTime() + this._elapsedTime;
    const i = et*100 | 0;
    
    if (et > this._ballData.tc) {
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
