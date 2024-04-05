import {expect, fixture, html} from '@open-wc/testing';
import './Icon.js';

describe('icon', () => {
  it('builds svg tag', async () => {
    const icon = await fixture(html`<u-icon sprite="foo" classes="icon"></u-icon>`);
    await expect(icon).to.have.html('<svg data-bind="class:classes" class="icon"><use xlink:href="http://localhost:8000/assets/images/icons.svg#foo"></use></svg>');
  });

  it('builds svg tag with multiple use tags for hover functionality', async () => {
    const icon = await fixture(html`<u-icon sprite="foo" hover-sprite="bar" classes="icon"></u-icon>`);
    await expect(icon).to.have.html('<svg data-bind="class:classes" class="icon"><use xlink:href="http://localhost:8000/assets/images/icons.svg#foo"></use><use xlink:href="http://localhost:8000/assets/images/icons.svg#bar"></use></svg>');
  });
});
