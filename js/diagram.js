import * as THREE from './three.module.js';
import {Line} from './line.js';
import {Arrow} from './arrow.js';

export class Diagram {
  constructor () {
    this._r = new Arrow();
    this._rPrime = new Arrow();
    this._R = new Arrow();

    this._otherLines = [];
    for (let i = 0; i < 8; i++) {
      this._otherLines.push(new Line());
    }
  }
  
  init(scene) {
    this._r.init(scene, "r");
    this._rPrime.init(scene, "r'");
    this._R.init(scene, "R");

    this._otherLines.forEach(line => line.initOrigin(scene));

    //    this.debugLines(scene);
  }
  
  update(tickData) {
    let ballPos = tickData.get("ball").position;
    let cyclopianEyePos = tickData.get("fielder").cyclopianEyePos;

    this._r.update(new THREE.Vector3(0, 0, 0), ballPos, tickData);
    this._rPrime.update(cyclopianEyePos, ballPos, tickData);
    this._R.update(new THREE.Vector3(0, 0, 0), cyclopianEyePos, tickData);

    { // Line 1
      let line = this._otherLines[0];
      let pos = ballPos.clone();
      pos.y = 0;
      line.update(tickData.get("ball").position, pos, tickData);
    }
    { // Line 2
      let line = this._otherLines[1];
      this._D = ballPos.clone();
      this._D.y = cyclopianEyePos.y;
      line.update(this._D, cyclopianEyePos, tickData);
    }
    { // Line 3
      let line = this._otherLines[2];
      this._E = this._D.clone();
      this._E.z = cyclopianEyePos.z;
      line.update(this._D, this._E, tickData);
    }
    { // Line 4
      let line = this._otherLines[3];
      line.update(cyclopianEyePos, this._E, tickData);
    }
    { // Line 5
      let line = this._otherLines[4];
      let pos = this._E.clone();
      pos.y = 0;
      line.update(pos, this._E, tickData);
    }
/*    { // Line 6
      let line = this._otherLines[5];
      let pos = cyclopianEyePos.clone();
      pos.x = 0;
      line.update(cyclopianEyePos, pos, tickData);
    }
    { // Line 7
      let line = this._otherLines[6];
      let pos = cyclopianEyePos.clone();
      pos.z = 0;
      line.update(cyclopianEyePos, pos, tickData);
    }*/
  }

  setPoints(ballPos, cyclopianEyePos) {
  }

  debugLines(scene) {
    // Distance of the center field fence (400 ft)
    var depth = new Line();
    depth.init(scene, new THREE.Vector3(0, 1, 0), new THREE.Vector3(121, 1, 0));
  }
}
