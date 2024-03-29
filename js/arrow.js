import * as THREE from './libs/three.module.js';
import {LineLabel} from './lineLabel.js';

export class Arrow {
  constructor () {
    this._label = new LineLabel();
    this._geo = null;
    this._scene = null;
  }

  init(scene, labelText) {
    this._scene = scene;
    this._label.init(labelText);
  }

  update(start, end, tickData) {
    if (this._geo) {
      this._geo.removeFromParent();
      this._geo.clear();
      this._geo.dispose();
    }
    var dir = end.clone().sub(start);
    var len = dir.length();
    
    this._geo = new THREE.ArrowHelper(dir.normalize(), start, len, 0xffff00, Math.min(1.5, len*0.2), Math.max(0.4, Math.min(1, len*0.2)));
    this._scene.add(this._geo);
    this._label.update(start, end, tickData);
  }
}
