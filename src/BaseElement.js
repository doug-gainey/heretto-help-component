import {select, selectAll} from './helpers/elementHelpers.js';
import {camelToKebabCase} from './helpers/stringHelpers.js';

// This base element provides simple data binding capabilities to any custom element extending it.
// Only extend from this element if your component needs data binding.
// Adapted from https://github.com/DannyMoerkerke/custom-element
export class BaseElement extends HTMLElement {
  state = {};

  constructor() {
    super();
  }

  #updateBinding(value, node, dataProp, callback) {
    const bindProp = dataProp.includes(':') ? dataProp.split(':').shift() : null;
    const bindValue = dataProp.includes('.')
      ? dataProp
          .split('.')
          .slice(1)
          .reduce((obj, p) => obj[p], value)
      : value;

    callback(bindProp, bindValue);
  }

  #setValue(node, prop, value) {
    if (prop) {
      if (value) {
        node.setAttribute(prop, value);
      } else {
        node.removeAttribute(prop);
      }

      return;
    }

    if (node.tagName.toLowerCase() === 'input') {
      node.value = value;
      return;
    }

    node.textContent = value;
  }

  #updateBindings(prop, value = '') {
    const bindings = [...this.selectAll(`[data-bind$="${prop}"]`)];
    bindings.forEach(node => this.#updateBinding(value, node, node.dataset.bind, (bindProp, bindValue) => this.#setValue(node, bindProp, bindValue)));

    const htmlBindings = [...this.selectAll(`[data-html="${prop}"]`)];
    htmlBindings.forEach(node => this.#updateBinding(value, node, node.dataset.html, (bindProp, bindValue) => (node.innerHTML = bindValue)));

    const conditionals = [...this.selectAll(`[data-if$="${prop}"]`)];
    conditionals.forEach(node => this.#updateBinding(value, node, node.dataset.if, (bindProp, bindValue) => (node.style.display = bindValue ? '' : 'none')));

    const notConditionals = [...this.selectAll(`[data-not$="${prop}"]`)];
    notConditionals.forEach(node => this.#updateBinding(value, node, node.dataset.not, (bindProp, bindValue) => (node.style.display = bindValue ? 'none' : '')));

    const showConditionals = [...this.selectAll(`[data-show$="${prop}"]`)];
    showConditionals.forEach(node => this.#updateBinding(value, node, node.dataset.show, (bindProp, bindValue) => (node.style.visibility = bindValue ? '' : 'hidden')));

    const hideConditionals = [...this.selectAll(`[data-hide$="${prop}"]`)];
    hideConditionals.forEach(node => this.#updateBinding(value, node, node.dataset.show, (bindProp, bindValue) => (node.style.visibility = bindValue ? 'hidden' : '')));

    const classConditionals = [...this.selectAll(`[data-class~="${prop}"]`)];
    classConditionals.forEach(node => this.#updateBinding(value, node, node.dataset.class, (bindProp, bindValue) => node.classList.toggle(camelToKebabCase(prop), bindValue)));
  }

  #getBindKey(key, obj) {
    return Object.keys(obj).map(k => (this.#isObject(obj[k]) ? `${key}.${this.#getBindKey(k, obj[k])}` : `${key}.${k}`));
  }

  #isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  }

  setState(newState) {
    Object.entries(newState).forEach(([key, value]) => {
      this.state[key] = this.#isObject(this.state[key]) && this.#isObject(value) ? {...this.state[key], ...value} : value;

      const bindKey = this.#isObject(value) ? this.#getBindKey(key, value) : key;
      const bindKeys = Array.isArray(bindKey) ? bindKey : [bindKey];

      bindKeys.forEach(key => this.#updateBindings(key, value));
    });
  }

  // Convenience methods
  addStylesheet(href, addToHead) {
    return new Promise(resolve => {
      const link = document.createElement('link');

      link.setAttribute('rel', 'stylesheet');
      link.setAttribute('href', href);
      link.addEventListener('load', resolve);
      (addToHead ? document.head : this.shadowRoot).appendChild(link);
    });
  }

  debounce(fn, wait) {
    let timer;

    return function (...args) {
      if (timer) {
        clearTimeout(timer);
      }

      const context = this;
      timer = setTimeout(() => {
        fn.apply(context, args);
      }, wait);
    };
  }

  select(selector, container) {
    return select(selector, container || this.shadowRoot || this);
  }

  selectAll(selector, container) {
    return selectAll(selector, container || this.shadowRoot || this);
  }
}
