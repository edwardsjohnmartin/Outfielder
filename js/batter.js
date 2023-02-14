import * as THREE from './libs/three.module.js';
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


  //-------------------------------
  // A more general hit.
  //
  hit(ball, distance, fielderPos) {
    var targetPos = fielderPos.clone();
    var up = new THREE.Vector3(0, 1, 0);
    var v1 = targetPos.clone().normalize();
    if (true) {
      targetPos.add(v1.cross(up).multiplyScalar(10)); // left of fielder
    }
    else {
      targetPos.add(up.cross(v1).multiplyScalar(10)); // right of fielder
    }
    this.hitDirect(ball, distance, targetPos);
  }
  
  //---------------------------------------------------------------
  // Need to run the simulation. Grab the hit angle from the UI,
  // then calculate off the bat speed.
  // This is easy while we're doing simple trajectory physics.
  hitDirect(ball, distance, targetPos) {
    var elevAngle = 30. * Math.PI / 180.; // from horizontal
    var hitSpeed;

    switch(distance) {
    case Batter.directLong:
      //      hitSpeed = 44.7; // 100 mph
      hitSpeed = 37;
      break;
    case Batter.directShort:
      hitSpeed = 33.7;
      break;
    case Batter.direct:
      hitSpeed = this.getHitSpeed(elevAngle, targetPos);
      break;
    default:
      hitSpeed = 22.0;
    }
      
    ball.reset();
    var horizontalComponent = hitSpeed*Math.cos(elevAngle);
    var launchDir = targetPos.clone();
    launchDir.y = 0;
    launchDir.normalize().multiplyScalar(horizontalComponent);
    launchDir.y = hitSpeed*Math.sin(elevAngle);
    
    ball.hit(launchDir);
  }

  //------------------------------------------
  //  Simulation is very simple right now.
  //
  //  http://hyperphysics.phy-astr.gsu.edu/hbase/traj.html#tra13
  //
  getHitSpeed(elevAngle, targetPos) {
    // Hit is from 0, 0
    // Assuming bat location and catch location is the same elevation
    var range = targetPos.length();
    var gravity = 9.81; // m / s**2

    return Math.sqrt(range * gravity / Math.sin(2 * elevAngle));
  }

  update(timeDelta) {
  }
}
