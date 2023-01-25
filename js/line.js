import * as THREE from './three.module.js';
import {Label} from './label.js';

export class Line {
  constructor () {
    this._label = null;
    this._geo = null;
  }
  
  init(scene, start, end) {
    const points = [];
    points.push(new THREE.Vector3(start.x, start.y, start.z));
    points.push(new THREE.Vector3(end.x, end.y, end.z));
    
    this._geo = new THREE.BufferGeometry().setFromPoints(points);
    this._geo.getAttribute('position').setUsage(THREE.DynamicDrawUsage);
    
    var line = new THREE.Line(this._geo, new THREE.LineBasicMaterial({color:0xffffff}));
    line.frustumCulled = false;
    scene.add(line);
  }
  
  update(start, end) {
    const position = this._geo.getAttribute('position');
    position.setXYZ(0, start.x, start.y, start.z);
    position.setXYZ(1, end.x, end.y, end.z);
    position.needsUpdate = true;
  }
}
