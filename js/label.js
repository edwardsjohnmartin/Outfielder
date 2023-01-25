import * as THREE from './three.module.js';

export class Label {
  constructor () {
    this._text = null;
    this._worldAnchor = null;
    this._worldPosition = new THREE.Vector3(0, 0, 0);
  }

  set position(pos) {this._worldPosition.copy(pos);}

  init(text) {
    this._text = document.createElement('div');
    this._text.style.position = 'absolute';
    this._text.style.width = 10;
    this._text.style.height = 10;
    this._text.style.backgroundColor = "rgba(0, 0, 200, .5)";
    this._text.style.color = "white";
    this._text.innerHTML = text;
    document.body.appendChild(this._text);
  }

  initWithAnchor(anchor, text) {
    this.init(text);
    this._worldAnchor = anchor;
  }

  release() {
    if (this._text == null) {
      return;
    }
    this._text.remove();
  }

  update(tickData) {
    if (this._worldAnchor) {
      this._worldAnchor.updateWorldMatrix(true, false);
      this._worldAnchor.getWorldPosition(this._worldPosition);
    }

    // Outside the camera view frustum (for example: behind)
    if (!tickData.get("frustum").containsPoint(this._worldPosition)) {
      this._text.style.visibility = "hidden";
      return;
    }

    var canvasRect = tickData.get("canvasRect");
    var vector = this._worldPosition.clone();
    vector.project(tickData.get("camera").renderCamera);
    var pos = new THREE.Vector2(canvasRect.left + (vector.x + 1)/2 * (canvasRect.right - canvasRect.left),
                                window.scrollY + canvasRect.top -(vector.y - 1)/2 * (canvasRect.bottom - canvasRect.top) - 10);
                                
    this._text.style.top = pos.y + 'px';
    this._text.style.left = pos.x + 'px';

    // Visibility
    if (pos.y < canvasRect.y ||
        pos.y > window.scrollY + canvasRect.y + canvasRect.height ||
        pos.x < canvasRect.x ||
        pos.x > canvasRect.x + canvasRect.width) {
      this._text.style.visibility = "hidden";
    }
    else {
      this._text.style.visibility = "visible";
    }
  }
}
