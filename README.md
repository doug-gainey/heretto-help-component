# Heretto Help Component

This is a component that makes calls to Heretto's api to provide in-product help via a slide out that can be launched from anywhere within the product.

## Getting started

### Install the package

```shell
npm install @gainedm/heretto-help-component
```

### Add the component to your project's HTML

```html
<heretto-help></heretto-help>
```

### Import and initialize the component

```javascript
import {HerettoHelp} from 'heretto-help';

// Initialize config values
HerettoHelp.init({
  // These values directly relate to Heretto's api calls:
  // https://help.heretto.com/en/heretto-deploy-api/deploy-api-overview
  apiUrl: 'https://deploy.heretto.com/v3/org', // The url to Heretto's api
  apiOrgId: '', // The organizationId in Heretto
  apiDeployId: '', // The deploymentId in Heretto
  apiToken: '', // The deploy API token in Heretto
  portalUrl: '', // The url to your Heretto client portal

  // These are a list of other urls to add to the help home page
  otherUrls: [
    {
      name: `Foo Link`,
      href: 'http://foo.com/'
    },
    {
      name: `Bar Link`,
      href: 'http://bar.com/',
      target: '_blank'
    }
  ]
});

// Toggle the drawer when #launch-heretto-help is clicked
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('launch-heretto-help').addEventListener('click', () => {
    document.querySelector('heretto-help').dispatchEvent(
      new CustomEvent('toggle', {
        detail: {
          resourceId: 'foo' // Correlates to a resource id in Heretto
        }
      })
    );
  });
});
```

The `toggle` event toggles the current state of the drawer by default. To explicitly open or close the drawer, the `toggle` event also accepts an `open` flag:

```javascript
document.querySelector('heretto-help').dispatchEvent(
  new CustomEvent('toggle', {
    detail: {
      open: false // This would close the drawer
    }
  })
);
```
