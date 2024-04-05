function select(selector, container) {
  if (typeof container === 'undefined') {
    container = this.shadowRoot || this;
  }

  return container.querySelector(selector);
}

function selectAll(selector, container) {
  if (typeof container === 'undefined') {
    container = this.shadowRoot || this;
  }

  return container.querySelectorAll(selector);
}

export {select, selectAll};
