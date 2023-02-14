import * as THREE from './libs/three.module.js';
import {Line} from './line.js';
import {Arrow} from './arrow.js';
import {Label} from './label.js';
import {Angle} from './angle.js';

export class Diagram {
  constructor () {
    this._r = new Arrow();
    this._rPrime = new Arrow();
    this._R = new Arrow();

    this._otherLines = [];
    for (let i = 0; i < 8; i++) {
      this._otherLines.push(new Line());
    }

    this._points = [];
    for (let i = 0; i < 5; i++) {
      this._points.push(new Label());
    }

    this._angles = [];
    this._angles.push(new Angle()); // Alpha
    this._angles.push(new Angle()); // Psi
}
  
  init(scene) {
    this._r.init(scene, "r");
    this._rPrime.init(scene, "L");
    this._R.init(scene, "R");

    this._otherLines.forEach(line => line.initOrigin(scene));

    this._points[0].init('A');
    this._points[0].position = new THREE.Vector3(0, 0, 0);
    this._points[1].init('B');
    this._points[2].init('C');
    this._points[3].init('D');
    this._points[4].init('E');

    this._angles[0].init(scene, "alpha");
    this._angles[1].init(scene, "psi");

    //    this.debugLines(scene);
  }
  
  update(tickData) {
    let ballPos = tickData.get("ball").position;
    let cyclopianEyePos = tickData.get("fielder").cyclopianEyePos;

    this._r.update(new THREE.Vector3(0, 0, 0), ballPos, tickData);
    this._rPrime.update(cyclopianEyePos, ballPos, tickData);
    this._R.update(new THREE.Vector3(0, 0, 0), cyclopianEyePos, tickData);

    this.updatePoints(tickData, ballPos, cyclopianEyePos);
    this.updateLines(tickData, ballPos, cyclopianEyePos);
    this.updateAngles(tickData, ballPos, cyclopianEyePos);
  }

  updateAngles(tickData, ballPos, cyclopianEyePos) {
    // Alpha
    var p1 = this._D.clone().sub(cyclopianEyePos);
    var p2 = ballPos.clone().sub(cyclopianEyePos);
    this.updateAngle(tickData, this._angles[0], cyclopianEyePos, p1, p2);

    // Psi
    p1 = this._E.clone().sub(cyclopianEyePos);
    p2 = this._D.clone().sub(cyclopianEyePos);
    this.updateAngle(tickData, this._angles[1], cyclopianEyePos, p1, p2);
  }

  updateAngle(tickData, angle, p0, p1, p2) {
    angle.position = p0;
    angle.forward = p1;
    angle.right = p1.clone().cross(p2);
    angle.radius = p2.length() / 5;
    angle.angle = p1.angleTo(p2);
    angle.update(tickData);
  }

  updatePoints(tickData, ballPos, cyclopianEyePos) {
    this._points[1].position = ballPos.clone();
    this._points[2].position = cyclopianEyePos.clone();

    this._D = ballPos.clone();
    this._D.y = cyclopianEyePos.y;
    this._points[3].position = this._D;
    
    this._E = this._D.clone();
    this._E.z = cyclopianEyePos.z;
    this._points[4].position = this._E;

    this._points.forEach(point => point.update(tickData));
  }

  updateLines(tickData, ballPos, cyclopianEyePos) {
    { // Line 1
      let line = this._otherLines[0];
      let pos = ballPos.clone();
      pos.y = 0;
      line.update(tickData.get("ball").position, pos, tickData);
    }
    { // Line 2
      let line = this._otherLines[1];
      line.update(this._D, cyclopianEyePos, tickData);
    }
    { // Line 3
      let line = this._otherLines[2];
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

  debugLines(scene) {
    // Distance of the center field fence (400 ft)
    var depth = new Line();
    depth.init(scene, new THREE.Vector3(0, 1, 0), new THREE.Vector3(121, 1, 0));
  }
}
