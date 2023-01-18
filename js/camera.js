import * as THREE from './three.module.js';

export class Camera {
  //-------------------
  // Some constants
  // Parallel values to camera selection list in index.html
  static get fielder() {return 0;}
  static get homePlate() {return 1;}
  static get chase() {return 2;}
  static get firstBase() {return 3;}
  static get thirdBase() {return 4;}
  static get fixed3() {return 5;}

  constructor () {
    this._which = this.fielder;
  }

  get renderCamera() {return this._renderCamera;}
  
  get which() {return this._which;}
  set which(cam) {
    var infieldCamDist = 35; // From home plate (90 feet is 27 meters)
    var infieldCamAngle = 53 * Math.PI / 180; // From vector between home base and the pitchers mound.  Just outside the infield.
    switch(cam) {
    case Camera.fielder:
      break;
    case Camera.homePlate:
      this._renderCamera.position.set(-5, 3.5, 0);
      this._renderCamera.lookAt(0, 0, 0);
      break;
    case Camera.chase:
      break;
    case Camera.firstBase: // First base
      this._renderCamera.position.set(infieldCamDist*Math.cos(infieldCamAngle), 3.5, infieldCamDist*Math.sin(infieldCamAngle));
      this._renderCamera.lookAt(0, 0, 0);
      break;
    case Camera.thirdBase: // Third base
      this._renderCamera.position.set(infieldCamDist*Math.cos(infieldCamAngle), 3.5, -infieldCamDist*Math.sin(infieldCamAngle));
      this._renderCamera.lookAt(0, 0, 0);
      break;
    case Camera.fixed3:
      this._renderCamera.position.set(0, 3.5, 5);
      this._renderCamera.lookAt(0, 0, 0);
      break;
    }
    this._which = cam;
    console.log("Camera: " + this._which);
  }

  init(width, height) {
    this._renderCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  }

  update(ballPos, fielderPos) {
    switch (this.which) {
    case Camera.fielder:
      this._renderCamera.position.set(fielderPos.x, fielderPos.y, fielderPos.z);
      // Fall through
    case Camera.homePlate:
    case Camera.chase:
    case Camera.firstBase:
    case Camera.thirdBase:
    case Camera.fixed3:
      this._renderCamera.lookAt(ballPos.x, ballPos.y, ballPos.z);
      break;
    }
  }
}

