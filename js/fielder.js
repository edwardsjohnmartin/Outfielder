import * as THREE from './libs/three.module.js';
import {ObjectLabel} from './objectLabel.js';
import {Pausable} from './pausable.js';

var outfielderDist = 106.0;
var outfielderAngle = 30 * Math.PI / 180;

export class Fielder extends Pausable {
  static get centerField() {return new THREE.Vector3(106.0, 0, 0);}
  static get leftField() {
    return new THREE.Vector3(outfielderDist*Math.cos(outfielderAngle), 0, -outfielderDist*Math.sin(outfielderAngle));
  }
  static get rightField() {
    return new THREE.Vector3(outfielderDist*Math.cos(outfielderAngle), 0, outfielderDist*Math.sin(outfielderAngle));
  }
  static get cyclopianEyeHeight() {return new THREE.Vector3(0, 1.879, 0);}  // 6'2"

  constructor () {
    super();
    this._velocity = new THREE.Vector3(0, 0, 0);
    this._rotation = new THREE.Vector3(0, 0, 0);
    this._fileLocation = "assets/characters/lowpoly_dude.glb";
    this._inited = false;
    this._label = new ObjectLabel();
    this._fielderData = null;
  }

  get inited() {return this._inited;}
  get fileLocation() {return this._fileLocation;}
  get rotation() {return this._rotation;}
  get cyclopianEyePos() {
    return this.position.clone().add(Fielder.cyclopianEyeHeight);
  }

  get position() {
    if (this._geo) {
      return this._geo.position;
    }
    return null;
  }

  set position(pos) {
    if (this._geo) {
      this._geo.position.copy(pos);
    }
  }

  set lookAt(pos) {
    if (this._geo) {
      let v = pos.sub(this._geo.position);
      let angle = -pos.angleTo(new THREE.Vector3(1, pos.y, 0));
      this._geo.rotation.set(0, angle, 0);
    }
  }

  init(geo) {
    this._geo = geo;
    this._inited = true;
    this.lookAt = new THREE.Vector3(-1, 0, 0);
//    this._label.init(geo, "Hoopdy");
  }

  hit(fielderData) {
    this.startClock();
    this._fielderData = fielderData;
  }

  update(tickData) {
    this._label.update(tickData);

    if (this.paused || !this._fielderData) {
      return;
    }

    if (this.elapsedTime > this._fielderData.tc) {
      this.stopClock();
      return;
    }

    const i = this.elapsedTime*100 | 0;
    this._geo.position.set(this._fielderData.yy[this._fielderData.motion][i]*0.3048,
                           0,
                           this._fielderData.xx[this._fielderData.motion][i]*0.3048);
  }
}
