import * as THREE from './three.module.js';
import {Label} from './label.js';

export class Line {
  constructor () {
    this._label = null;
    this._geo = null;
  }
  
  init(scene, start, end, labelText) {
    const points = [];
    points.push(start.clone());
    points.push(end.clone());
    
    this._geo = new THREE.BufferGeometry().setFromPoints(points);
    this._geo.getAttribute('position').setUsage(THREE.DynamicDrawUsage);
    
    var line = new THREE.Line(this._geo, new THREE.LineBasicMaterial({color:0xffffff}));
    line.frustumCulled = false;
    scene.add(line);
    if (labelText) {
      this._label = new Label();
      this._label.init(labelText);
    }
  }
  
  update(start, end, tickData) {
    const position = this._geo.getAttribute('position');
    position.setXYZ(0, start.x, start.y, start.z);
    position.setXYZ(1, end.x, end.y, end.z);
    position.needsUpdate = true;
    if (this._label) {
      this.setLabelPos(start, end);
      this._label.update(tickData);
    }
  }

  setLabelPos(start, end) {
    var diff = end.clone().sub(start);
    var len = diff.length();
    this._label.position = start.clone().add(diff.normalize().multiplyScalar(len/2));
  }
}
