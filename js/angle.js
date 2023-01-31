import * as THREE from './libs/three.module.js';
import {Label} from './label.js';

export class Angle {
  static get radiusMax() {return 3;}

  constructor () {
    this._label = new Label();
    this._geo = null;
    this._radius = Angle.radiusMax;
    this._angle = 90 * Math.PI / 180;
    this._position = new THREE.Vector3(0, 0, 0);
    this._forward = new THREE.Vector3(0, 0, 0);
    this._right = new THREE.Vector3(0, 0, 0);
  }

  set radius(val) {this._radius = Math.min(val, Angle.radiusMax);}
  set angle(val)  {this._angle = val;}
  set position(vec) {this._position.copy(vec);}
  set forward(vec) {this._forward.copy(vec).normalize();}
  set right(vec) {this._right.copy(vec).normalize();}

  init(scene, labelText) {
    this._scene = scene;
    this._label.init(labelText);
    this._label.position = this._position;
  }
  
  update(tickData) {
    if (this._geo) {
      this._geo.removeFromParent();
      this._geo.geometry.dispose();
      this._geo.material.dispose();
      this._geo.clear();
    }

    const curve = new THREE.EllipseCurve(0,  0, this._radius, this._radius, 0, this._angle, false, 0);
    this._geo = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(20)),
                               new THREE.LineBasicMaterial({color: 0x0000ff}))
    this._geo.frustumCulled = false;
    this._geo.position.copy(this._position);
    this._geo.lookAt(this._position.clone().add(this._right));
    this._scene.add(this._geo);

    this._label.position = this._position.clone().add(this._forward.clone().setLength(this._radius+.5));
    this._label.update(tickData);
  }
}
