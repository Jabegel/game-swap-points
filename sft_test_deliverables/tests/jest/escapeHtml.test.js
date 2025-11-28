
const { escapeHtml } = require('../../src_helpers/escapeHtml');
describe('escapeHtml', () => {
  test('escapes < and > and & and quotes', () => {
    const s = '<div class="a">Tom & Jerry\'s</div>';
    expect(escapeHtml(s)).toBe('&lt;div class=&quot;a&quot;&gt;Tom &amp; Jerry&#39;s&lt;/div&gt;');
  });
  test('handles null/undefined', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });
});
