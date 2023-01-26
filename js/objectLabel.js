import * as THREE from './three.module.js';
import {Label} from './label.js';

// Should refactor this and LineLabel to push more out of the Line class and also subclass Line.
export class ObjectLabel {
  constructor () {
    this._label = null;
  }

  init(anchor, labelText) {
    if (labelText) {
      this._label = new Label();
      this._label.initWithAnchor(anchor, labelText);
    }
  }

  update(tickData) {
    if (this._label) {
      this._label.update(tickData);
    }
  }
}
