import * as THREE from './libs/three.module.js';

export class MotionPaths {
  constructor() {
    this._motionPoints = [];
    this._motionPoints[1] = [];
    this._motionPoints[2] = [];
    this._motionPoints[3] = [];

    this._paths = [];
  }

  init(scene) {
    this._scene = scene;
  }

  hit(hitData) {
    this._hitData = hitData;
    this._motionPoints[hitData.motion].length = 0;
  }

  //------------------------------------------------------
  // Return value indicates that we're done.
  // It isn't an awesome architecture, but I wanted
  // motionLines encapsulated by Diagram.
  update(tickData, paused, elapsedTime) {
    if (paused || !this._hitData) {
      return false;
    }
    if (elapsedTime > this._hitData.tc) { // We're done
      return true;
    }

    const fielderPos = tickData.get("fielder").position.clone();
    fielderPos.y = .1;
    const motionPoints = this._motionPoints[this._hitData.motion];
    
    if (motionPoints.length == 0 || fielderPos.distanceToSquared(motionPoints[motionPoints.length-1]) > 0.5) {
      motionPoints.push(fielderPos);
      this.createPath(motionPoints);
    }
    return false;
  }

  reset() {
    for (var i = 1; i <= 3; i++) {
      this._motionPoints[i].length = 0;
      if (this._paths[i]) {
        this.destroyPath(this._paths[i]);
        this._paths[i] = null;
      }
    }
  }

  createPath() {
    const motionPoints = this._motionPoints[this._hitData.motion];
    if (this._paths[this._hitData.motion]) {
      this.destroyPath(this._paths[this._hitData.motion]);
    }
    const buffer = new THREE.BufferGeometry().setFromPoints(motionPoints);
    const path = new THREE.Line(buffer, new THREE.LineBasicMaterial({color:this.pathColor()}));
    path.frustumCulled = false;
    this._scene.add(path);
    this._paths[this._hitData.motion] = path;
  }

  destroyPath(geo) {
    geo.removeFromParent();
    geo.geometry.dispose();
    geo.material.dispose();
    geo.clear();
  }

  pathColor() {
    switch (this._hitData.motion) {
    case 1: // TP
      return 0xff0000;
    case 2: // OAC
      return 0x00ff00;
    case 3: // AAC
      return 0x0000ff;
    }
    return 0xffffff;
  }
}
