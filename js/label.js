import * as THREE from './three.module.js';

export class Label {
  constructor () {
    this._text = null;
    this._worldAnchor = null;
  }

  init(anchor, text) {
    this._text = document.createElement('div');
    this._text.style.position = 'absolute';
    //this._text.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
    this._text.style.width = 10;
    this._text.style.height = 10;
    this._text.style.backgroundColor = "blue";
    this._text.style.color = "white";
    this._text.innerHTML = text;
    this._text.style.top = 400 + 'px';
    this._text.style.left = 400 + 'px';
    document.body.appendChild(this._text);
    this._worldAnchor = anchor;
  }

  release() {
    if (this._text == null) {
      return;
    }
    this._text.remove();
  }

  update(camera, canvasRect) {
    if (this._worldAnchor == null) {
      return;
    }
    var vector = new THREE.Vector3();
    this._worldAnchor.updateWorldMatrix(true, false);
    this._worldAnchor.getWorldPosition(vector);

    vector.project(camera.renderCamera);
    var pos = new THREE.Vector2(canvasRect.left + (vector.x + 1)/2 * (canvasRect.right - canvasRect.left),
                                window.scrollY + canvasRect.top -(vector.y - 1)/2 * (canvasRect.bottom - canvasRect.top));
                                
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
