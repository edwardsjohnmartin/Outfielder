import * as THREE from './libs/three.module.js';
import {LineLabel} from './lineLabel.js';

export class Line {
  constructor () {
    this._label = new LineLabel();
    this._geo = null;
  }

  initOrigin(scene, labelText) {
    this.init(scene, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), labelText);
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

    this._label.init(labelText);
  }
  
  update(start, end, tickData) {
    const position = this._geo.getAttribute('position');
    position.setXYZ(0, start.x, start.y, start.z);
    position.setXYZ(1, end.x, end.y, end.z);
    position.needsUpdate = true;
    this._label.update(start, end, tickData);
  }
}
