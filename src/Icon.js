// Copyright (c) 2024, gainedm
// All rights reserved.
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.
import {BaseElement} from './BaseElement.js';

const svgNS = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink';

// Vite doesn't include svg files in the build when they're imported, so we keep them in /public/ for now.
const icons = new URL('../assets/images/icons.svg', import.meta.url).href;

// Preload icons
new Image().src = icons;

// noinspection JSUnusedGlobalSymbols
export default class Icon extends BaseElement {
  static get observedAttributes() {
    return ['sprite', 'hover-sprite', 'classes'];
  }

  constructor() {
    super();

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('data-bind', 'class:classes');
    svg.appendChild(document.createElementNS(svgNS, 'use'));
    this.appendChild(svg);
  }

  set sprite(value) {
    this.setAttribute('sprite', value);
  }

  get sprite() {
    return this.getAttribute('sprite');
  }

  set hoverSprite(value) {
    this.setAttribute('hover-sprite', value);
  }

  get hoverSprite() {
    return this.getAttribute('hover-sprite');
  }

  set classes(value) {
    this.setAttribute('classes', value);
  }

  get classes() {
    return this.getAttribute('classes');
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'classes') {
      this.setState({classes: newValue});
    } else if (name === 'sprite') {
      this.selectAll('use')[0].setAttributeNS(xlinkNS, 'href', `${icons}#${newValue}`);
    } else if (name === 'hover-sprite' && oldValue && newValue) {
      this.selectAll('use')[1].setAttributeNS(xlinkNS, 'href', `${icons}#${newValue}`);
    } else if (name === 'hover-sprite' && oldValue) {
      delete this.dataset.hoverParent;
      this.selectAll('use')[1].remove();
    } else if (name === 'hover-sprite' && newValue) {
      const hoverSprite = document.createElementNS(svgNS, 'use');
      hoverSprite.setAttributeNS(xlinkNS, 'href', `${icons}#${newValue}`);
      this.select('svg').appendChild(hoverSprite);
      if (!this.closest('[data-hover-parent]')) {
        this.dataset.hoverParent = 'true';
      }
    }
  }
}

customElements.define('u-icon', Icon);
