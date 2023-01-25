import * as THREE from './three.module.js';

export class Point {
  constructor () {
    this._geo = null;
    this._radius = .33;
  }

  set position(pos) {
    this._geo.position.set(pos.x, pos.y, pos.z);
  }

  init(scene) {
    const geometry = new THREE.SphereGeometry(radius, 10, 6);
    const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    this._geo = new THREE.Mesh( geometry, material );
    scene.add(this._geo);
  }

  release() {
  }

  update() {
  }
}
