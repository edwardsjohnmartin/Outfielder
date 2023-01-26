import * as THREE from './three.module.js';
import {Label} from './label.js';

export class LineLabel {
  constructor () {
    this._label = null;
  }

  init(labelText) {
    if (labelText) {
      this._label = new Label();
      this._label.init(labelText);
    }
  }

  update(start, end, tickData) {
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
