import {expect, fixture, html, waitUntil} from '@open-wc/testing';
import HerettoHelp from './HerettoHelp.js';

const options = {
  apiUrl: 'https://foo-api-url.com',
  apiOrgId: 'fooOrgId',
  apiDeployId: 'fooDeployId',
  apiToken: 'fooToken',
  portalUrl: 'https://foo-help-url.com',
  otherUrls: [
    {
      text: 'Google',
      href: 'http://google.com/'
    }
  ]
};

const toggleEvent = new CustomEvent('toggle', {
  detail: {resourceId: 'foo'}
});

async function buildHerettoHelp() {
  HerettoHelp.init(options);
  return await fixture(html` <heretto-help></heretto-help>`);
}

describe('heretto help', () => {
  it('adds font and icon stylesheets to page head', async () => {
    await buildHerettoHelp();
    await expect(document.querySelector('head > link[href="//fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;0,900;1,400;1,700&display=swap"]'), 'Lato font not loaded').to.exist;
    await expect(document.querySelector('head > link[href="//fonts.googleapis.com/icon?family=Material+Icons"]'), 'Material icon font not loaded').to.exist;
  });

  it('builds html', async () => {
    const herettoHelp = await buildHerettoHelp();
    await waitUntil(() => herettoHelp.shadowRoot.querySelector('.heretto-help'), 'Help Drawer failed to build');
    await expect(herettoHelp.shadowRoot.querySelector('link[href="http://localhost:8000/assets/styles/heretto-help.less"]'), 'Help styles not loaded').to.exist;
    await expect(herettoHelp.shadowRoot.querySelector('.overlay--main'), 'Overlay not built').to.exist;
    await expect(herettoHelp.shadowRoot.querySelector('.heretto-help__content'), 'Content not built').to.exist;
    await expect(herettoHelp.shadowRoot.querySelector('.heretto-help__content > header'), 'Header not built').to.exist;
    await expect(herettoHelp.shadowRoot.querySelector('.heretto-help__content > main'), 'Main not built').to.exist;
    await expect(herettoHelp.shadowRoot.querySelector('.heretto-help__content > footer'), 'Footer not built').to.exist;
  });

  it('toggles visibility when the toggle event is triggered', async () => {
    const herettoHelp = await buildHerettoHelp();

    herettoHelp.dispatchEvent(toggleEvent);
    await waitUntil(() => herettoHelp.shadowRoot.host.classList.contains('heretto-help--open'), 'Toggle event did not open drawer');

    herettoHelp.dispatchEvent(toggleEvent);
    await waitUntil(() => !herettoHelp.shadowRoot.host.classList.contains('heretto-help--open'), 'Toggle event did not close drawer');
  });

  it('initalizes state when the toggle event is triggered', async () => {
    const herettoHelp = await buildHerettoHelp();

    herettoHelp.dispatchEvent(toggleEvent);
    await expect(herettoHelp.state.portalUrl).to.eq(options.portalUrl);
    await expect(herettoHelp.state.showSearch).to.eq(false);
    await expect(herettoHelp.state.searchText).to.eq('');
    await expect(herettoHelp.state.isSearching).to.eq(false);
    await expect(herettoHelp.state.isComplete).to.eq(false);
    await expect(herettoHelp.state.searchResults).to.eq(null);
    await expect(herettoHelp.state.totalResults).to.eq(0);
    await expect(herettoHelp.state.totalResultsText).to.eq('');
    await expect(herettoHelp.state.history.length).to.eq(0);
  });
});
