import * as THREE from './libs/three.module.js';
import {Ball} from './ball.js';
import {Outfielder} from './outfielder.js';

export class Batter {
  constructor () {
    this._position = new THREE.Vector3(0, 0, 0);
    this._outfielderData = null;
  }

  get position() {
    return this._position;
  }

  set position(pos) {
    this._position.set(pos.x, pos.y, pos.z);
  }

  hit(ball, fielder, hitData) {
    this._outfielderData = Outfielder(hitData);
    this._outfielderData.motion = hitData.motion;
    ball.hit(this._outfielderData);
    fielder.hit(this._outfielderData);
  }
}
