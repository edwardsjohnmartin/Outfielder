import * as THREE from './three.module.js';
import {Ball} from './ball.js';

export class Batter {
  constructor () {
    this._position = new THREE.Vector3(0, 0, 0);
  }

  get position() {
    return this._position;
  }

  set position(pos) {
    this._position.set(pos.x, pos.y, pos.z);
  }

  hit(ball) {
    var hitAngle = Math.PI * (30. / 180.); // from horizontal
    //    var hitSpeed = 44.7; // 100 mph
    var hitSpeed = 33.7;
    ball.reset(new THREE.Vector3(hitSpeed*Math.cos(hitAngle), hitSpeed*Math.sin(hitAngle), 0));
  }

  update(timeDelta) {
  }
}
