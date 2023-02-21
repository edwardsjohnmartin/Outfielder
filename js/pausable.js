import * as THREE from './libs/three.module.js';

export class Pausable {
  constructor () {
    this._clock = null;
    this._elapsedTime = 0;
    this._pause = false;
  }

  set pause(p) {
    this._pause = p;
    if (!this._clock) { // Not running a ball sim.
      return;
    }
    
    if (p) {
      this._elapsedTime = this._elapsedTime + this._clock.getElapsedTime();
      this._clock.stop();
    }
    else {
      this._clock.start();
    }
  }

  get elapsedTime() {
    return this._clock.getElapsedTime() + this._elapsedTime;
  }

  get paused() {
    return this._clock == null || this._pause;
  }

  startClock() {
    this._clock = new THREE.Clock();
    this._elapsedTime = 0;
  }

  stopClock() {
    this._clock = null;
  }
}
