import * as THREE from './libs/three.module.js';
import {ObjectLabel} from './objectLabel.js';

export class Point_UNUSED {
  constructor () {
    this._geo = null;
    this._radius = .33;
    this._labelOnly = false;
  }

  set position(pos) {this._geo.position.copy(pos);}
  set labelOnly(val) {this._labelOnly = val;}

  init(scene, labelText) {
    this._label = new ObjectLabel();

    if (!this._labelOnly) {
      const geometry = new THREE.SphereGeometry(.1, 10, 6);
      const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
      this._geo = new THREE.Mesh( geometry, material );
      scene.add(this._geo);  // scene is the scene
      this._label.init(this._geo, labelText);
    }
    else {
      this._label.init(scene, labelText); // scene is the object
    }
  }

  update(tickData) {
    this._label.update(tickData);
  }
}
