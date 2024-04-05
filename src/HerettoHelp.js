// Copyright (c) 2024, Doug Gainey
// All rights reserved.
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.
import {BaseElement} from './BaseElement.js';
import './Icon.js';
import api from './api/HerettoApi.js';
import css from '../assets/styles/heretto-help.less?url';

// noinspection JSUnusedGlobalSymbols
export default class HerettoHelp extends BaseElement {
  static #portalUrl;
  static #urls;

  static init({apiUrl, apiOrgId, apiDeployId, apiToken, portalUrl, otherUrls}) {
    api.init(apiUrl, apiOrgId, apiDeployId, apiToken);
    HerettoHelp.#portalUrl = portalUrl;
    HerettoHelp.#urls = otherUrls;
  }

  #wrapper;
  #bodyOverflow;
  #eventBindings = [];

  constructor() {
    super();

    // Create a shadow root
    this.attachShadow({mode: 'open'});

    // Load stylesheets
    const fonts = this.addStylesheet('//fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;0,900;1,400;1,700&display=swap', true);
    const styles = this.addStylesheet(new URL('..' + css, import.meta.url).href);

    // Material icons are used within the help content
    const icons = this.addStylesheet('//fonts.googleapis.com/icon?family=Material+Icons', true);

    // Build HTML
    this.#wrapper = document.createElement('div');
    this.#wrapper.setAttribute('class', 'heretto-help');
    this.#wrapper.innerHTML = `
      <div class="overlay overlay--main js-toggle-drawer"></div>
      <div class="heretto-help__content">
        <header class="header flex">
          <h2 class="flex__fill"><a class="js-home" href="javascript:void(0);">Help</a></h2>
          <a class="flex js-show-search" href="javascript:void(0);">
            <u-icon sprite="search" classes="icon icon--muted icon--hover"></u-icon>
          </a>
          <a class="flex js-toggle-drawer" href="javascript:void(0);">
            <u-icon sprite="close" classes="icon icon--muted icon--hover"></u-icon>
          </a>
        </header>
        <main class="main">
          <section data-not="article.href">
            <h3>TOP RESULT</h3>
            <div class="js-resource-article"></div>
            <a class="link see-all"  target="_blank" data-bind="href:portalUrl">See All Help Articles <u-icon sprite="new-window" classes="icon icon--sm"></u-icon></a>
            <nav class="more-links">
              <h3>MORE HELP</h3>
              <ul class="js-more-links-content"></ul>
            </nav>
          </section>
          <section data-if="article.href">
              <div class="toolbar flex">
                <a class="btn btn--link btn--sm js-go-back" href="javascript:void(0);">
                  <u-icon sprite="arrow-left" classes="icon"></u-icon>
                  Back
                </a>
                <div class="flex__fill"></div>
                <a class="btn btn--secondary btn--sm" target="_blank" data-bind="href:article.href">
                  Open In A New Tab
                  <u-icon sprite="new-window" classes="icon icon--sm"></u-icon>
                </a>
              </div>
              <div class="article-content js-article-content"></div>
          </section>
          <section data-if="showSearch">
            <div class="overlay"></div>
            <div class="dialog dialog--has-subheader">
                <div class="dialog__header">
                  <fieldset class="horizontal">
                      <div class="flex flex__fill icon-overlay">
                        <input data-bind="searchText" class="search flex__fill js-search-input" placeholder="How can we help?" type="text">
                        <u-icon data-show="isSearching" sprite="spinner" classes="icon icon--muted icon--spin icon-overlay__icon"></u-icon>
                        <a data-show="isComplete" class="icon-overlay__text text-bold text-link js-clear-search" href="javascript:void(0);">Clear</a>
                      </div>
                      <a class="flex js-close-search" href="javascript:void(0);">
                        <u-icon sprite="close" classes="icon icon--muted icon--hover"></u-icon>
                      </a>
                  </fieldset>
                </div>
                <div data-if="totalResultsText" class="dialog__subheader">
                  <div class="text-sm text-muted">
                    <span data-bind="totalResultsText"></span>
                  </div>
                </div>
                <div data-if="totalResults" class="dialog__content">
                  <div class="js-search-results"></div>
                </div>
            </div>
          </section>
        </main>
        <footer class="footer">
            <p>Copyright &copy; 2024, <a href="https://github.com/doug-gainey">Doug Gainey</a>.</p>
        </footer>
      </div>`;

    // Append HTML only after stylesheets have loaded
    Promise.all([fonts, styles, icons]).then(() => {
      this.shadowRoot.appendChild(this.#wrapper);
    });
  }

  select(selector, container) {
    return super.select(selector, container || this.#wrapper);
  }

  selectAll(selector, container) {
    return super.selectAll(selector, container || this.#wrapper);
  }

  #updateState(state) {
    if (this.shadowRoot) {
      this.shadowRoot.host.setState(state);
    }

    Object.assign(this.state, state);
  }

  #resetView() {
    this.#updateState({
      // Article view
      article: {
        href: null
      },

      // Search
      showSearch: false,
      searchText: '',
      isSearching: false,
      isComplete: false,
      searchResults: null,
      totalResults: 0,
      totalResultsText: '',

      // Back button
      history: []
    });
  }

  #updateArticleLinks(container) {
    this.selectAll('a[href^="/"]', container).forEach(link => {
      const href = link.getAttribute('href');

      link.setAttribute('data-path', href);
      link.setAttribute('href', HerettoHelp.#portalUrl + href);
      link.setAttribute('target', '_blank');
    });
  }

  #getArticleError(errorMessage, href) {
    return {
      href,
      content: `<article>${errorMessage}</article>`
    };
  }

  #loadArticle(article, container) {
    const html = [];

    if (article.header) {
      html.push(article.header);
    }

    article.href = `${HerettoHelp.#portalUrl}/${article.href}`;

    // Strip <body> and <main> wrappers
    html.push(article.content.replace(/^<body[^>]*><main[^>]*>((.|\n)+)<\/main><\/body>$/gi, '$1'));

    container.innerHTML = html.join('');
    this.#updateArticleLinks(container);
  }

  async #loadResourceArticle(resourceId) {
    let article;
    try {
      article = await api.getArticle({
        'for-resourceid': resourceId
      });

      const content = article.content
        .replace(/<[^>]*>/gi, ' ')
        .trim()
        .replace(new RegExp('^' + article.title, 'gi'), '')
        .trim();

      this.select('.js-resource-article').innerHTML = `
          <article>
            <a class="search-result search-result--main" data-path="${article.href}" href="javascript:void(0);">
              <h1>${article.title}</h1>
              <div>
                ${content}
              </div>
            </a>
          </article>`;
    } catch (e) {
      article = this.#getArticleError(`We couldn't find an article specific to this page.  Please try the search option or browse all help articles below.`);

      this.#loadArticle(article, this.select('.js-resource-article'));
    }
  }

  async #toggleDrawer(event) {
    const currentlyOpen = this.shadowRoot.host.classList.contains('heretto-help--open');
    const open = event?.detail?.open;
    const openDrawer = open === true || (!currentlyOpen && typeof open !== 'boolean');

    if (!currentlyOpen && openDrawer) {
      // Update urls
      this.#updateState(Object.assign({portalUrl: HerettoHelp.#portalUrl}, HerettoHelp.#urls));

      // Set default view
      this.#resetView();

      // Get resource article
      await this.#loadResourceArticle(event?.detail?.resourceId);

      // Update links
      if (HerettoHelp.#urls && HerettoHelp.#urls.length) {
        const moreLinks = this.select('.js-more-links-content');

        moreLinks.innerHTML = '';

        HerettoHelp.#urls.forEach(link => {
          const liTag = document.createElement('li');

          const aTag = document.createElement('a');
          aTag.setAttribute('class', 'link');
          aTag.setAttribute('href', link.href);
          aTag.textContent = link.text;

          if (link.target) {
            aTag.setAttribute('target', link.target);
            aTag.insertAdjacentHTML('beforeend', '<u-icon sprite="new-window" classes="icon icon--sm"></u-icon>');
          }

          liTag.append(aTag);
          moreLinks.append(liTag);
        });
      }

      this.select('.more-links').classList.toggle('hidden', !HerettoHelp.#urls || !HerettoHelp.#urls.length);

      // Set scroll position
      this.#resetScroll();

      // Hide body overflow when opening help
      this.#bodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else if (currentlyOpen && !openDrawer) {
      // Reset body overflow when closing help
      document.body.style.overflow = this.#bodyOverflow;
      this.#bodyOverflow = null;
    }

    this.shadowRoot.host.classList.toggle('heretto-help--open', openDrawer);
  }

  #resetScroll(anchor, container) {
    if (anchor) {
      const target = this.select(`#${anchor}`, container);

      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
        return;
      }
    }

    this.select('.main').scrollTop = 0;
    this.selectAll('.dialog__content').forEach(dialog => (dialog.scrollTop = 0));
  }

  #resetSearch() {
    this.#updateState({
      isSearching: false,
      isComplete: false,
      searchText: '',
      searchResults: null,
      totalResults: 0,
      totalResultsText: ''
    });

    this.select('.js-search-input').focus();
    this.#resetScroll();
  }

  #back() {
    if (this.state.history.length) {
      const article = this.state.history.pop();
      this.#loadArticle(article, this.select('.js-article-content'));
      this.#updateState({article});
    } else {
      this.#updateState({
        article: {
          href: null
        }
      });
    }

    this.#resetScroll();
  }

  async #selectArticle(link) {
    const forPathParts = link.dataset.path.split('#');
    const forPath = forPathParts[0];
    const anchor = forPathParts[1];
    const container = this.select('.js-article-content');

    // Make sure this isn't a named anchor for the current article
    if (this.state.article.href !== `${HerettoHelp.#portalUrl}${forPath}`) {
      let article;
      try {
        article = await api.getArticle({
          'for-path': forPath
        });
      } catch (e) {
        article = this.#getArticleError(`We couldn't find that article.  Please try the search option.`, link.dataset.path);
      }

      this.#loadArticle(article, container);

      // Add current article to history
      if (this.state.article.href) {
        this.state.history.push(this.state.article);
      }

      this.#updateState({article});
    }

    this.#resetScroll(anchor, container);
  }

  async #search() {
    this.#updateState({
      isSearching: true,
      isComplete: false
    });

    const searchText = this.select('.js-search-input').value;
    const container = this.select('.js-search-results');
    const html = [];
    let searchResults;
    let totalResults = 0;
    let totalResultsText = '';

    try {
      const result = await api.search({
        queryString: searchText
      });
      searchResults = result.hits;
      totalResults = result.totalResults;
      totalResultsText = totalResults === 0 ? 'Sorry, no results found.' : `${totalResults} result${totalResults === 1 ? '' : 's'}`;

      if (totalResults) {
        searchResults.forEach(article => {
          html.push(`
          <article>
            <a data-if="searchText" class="search-result" data-path="${article.href}" href="javascript:void(0);">
              <h1>${article.title}</h1>
              ${article.highlights[0]}
            </a>
          </article>`);
        });
      }
    } catch (e) {
      searchResults = [];
    }

    container.innerHTML = html.join('');

    this.#updateState({
      isSearching: false,
      isComplete: true,
      searchText,
      searchResults,
      totalResults,
      totalResultsText,
      article: {
        href: null
      }
    });
    this.#resetScroll();
  }

  #addEventBinding(element, type, listener) {
    this.#eventBindings.push({element, type, listener});
    element.addEventListener(type, listener);
  }

  #getEventOptions() {
    return {
      detail: {
        open: !this.shadowRoot.host.classList.contains('heretto-help--open')
      }
    };
  }

  connectedCallback() {
    // Setting the view
    this.#addEventBinding(this.select('.js-home'), 'click', () => this.#resetView());
    this.#addEventBinding(this.select('.js-show-search'), 'click', () => {
      this.#updateState({showSearch: true});
      this.select('.js-search-input').focus();
    });
    this.selectAll('.js-go-back').forEach(link => {
      this.#addEventBinding(link, 'click', () => this.#back());
    });

    // Search form
    this.#addEventBinding(this.select('.js-close-search'), 'click', () => this.#updateState({showSearch: false}));
    this.#addEventBinding(this.select('.js-clear-search'), 'click', () => this.#resetSearch());
    this.#addEventBinding(
      this.select('.js-search-input'),
      'input',
      this.debounce(() => this.#search(), 500)
    );

    // Article links (from search results and within articles)
    this.#addEventBinding(this.#wrapper, 'click', event => {
      const link = event.target.closest('.search-result, .article-content a');

      if (link) {
        this.#updateState({showSearch: false});
        this.#selectArticle(link);
        event.preventDefault();
      }
    });

    // Toggling the drawer
    this.#addEventBinding(this, 'toggle', this.#toggleDrawer);
    this.selectAll('.js-toggle-drawer').forEach(link => {
      this.#addEventBinding(link, 'click', () => this.dispatchEvent(new CustomEvent('toggle', this.#getEventOptions())));
    });
  }

  disconnectedCallback() {
    // Remove event bindings
    while (this.#eventBindings.length) {
      const binding = this.#eventBindings.pop();
      binding.element.removeEventListener(binding.type, binding.listener);
    }
  }
}

customElements.define('heretto-help', HerettoHelp);
