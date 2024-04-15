// Copyright (c) 2024, Doug Gainey
// All rights reserved.
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.
let instance = null;

// noinspection JSCheckFunctionSignatures
class HerettoApi {
  #baseUrl;
  #token;
  #orgId;
  #deployId;
  #headers;

  constructor() {
    if (instance) {
      return instance;
    }

    instance = this;
  }

  init(baseUrl, orgId, deployId, token) {
    this.#baseUrl = baseUrl;
    this.#orgId = orgId;
    this.#deployId = deployId;
    this.#token = token;
    this.#headers = new Headers({
      'X-Deploy-API-Auth': token
    });
  }

  #fetch(url, method, options) {
    return fetch(`${this.#baseUrl}/${this.#orgId}/deployments/${this.#deployId}${url}?${method === 'GET' ? new URLSearchParams(options).toString() : ''}`, {
      method,
      headers: this.#headers,
      body: method === 'POST' ? JSON.stringify(options) : null
    }).then(response => {
      if (response.ok) {
        return response.json();
      }

      return Promise.reject(response);
    });
  }

  getStructure = options => {
    return this.#fetch('/structure', 'GET', options);
  };

  getArticle = options => {
    return this.#fetch('/content', 'GET', options);
  };

  search = options => {
    return this.#fetch('/search', 'POST', options);
  };
}

export default new HerettoApi();
