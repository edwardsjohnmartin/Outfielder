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

  //-------------------
  // Some constants
  static get direct() {return 0;}
  static get directLong() {return 1;}
  static get directShort() {return 2;}


  //---------------------------------------------------------------
  // Need to run the simulation. Grab the hit angle from the UI,
  // then calculate off the bat speed.
  // This is easy while we're doing simple trajectory physics.
  hitDirect(ball, distance, targetPos) {
    var hitAngle = 30. * Math.PI / 180.; // from horizontal
    var hitSpeed;

    switch(distance) {
    case Batter.directLong:
      hitSpeed = 44.7; // 100 mph
      break;
    case Batter.directShort:
      hitSpeed = 33.7;
      break;
    case Batter.direct:
      hitSpeed = this.getHitSpeed(hitAngle, targetPos);
      break;
    default:
      hitSpeed = 22.0;
    }
      
    ball.reset();
    ball.hit(new THREE.Vector3(hitSpeed*Math.cos(hitAngle), hitSpeed*Math.sin(hitAngle), 0));
  }

  //------------------------------------------
  //  Simulation is very simple right now.
  //
  //  http://hyperphysics.phy-astr.gsu.edu/hbase/traj.html#tra13
  //
  getHitSpeed(hitAngle, targetPos) {
    // Hit is from 0, 0
    // Assuming bat location and catch location is the same elevation
    var range = targetPos.length();
    var gravity = 9.81; // m / s**2

    return Math.sqrt(range * gravity / Math.sin(2 * hitAngle));
  }

  update(timeDelta) {
  }
}
