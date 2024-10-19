import { isTextNode, isValidHtmlAttribute } from '../utils';

describe('Virtual DOM Utilities', () => {
  // Verifies that the function correctly identifies strings, numbers, and booleans as text nodes, and rejects objects, arrays, null, and undefined.
  test('isTextNode should correctly identify text nodes', () => {
    expect(isTextNode('Hello')).toBe(true);
    expect(isTextNode(123)).toBe(true);
    expect(isTextNode(true)).toBe(true);
    expect(isTextNode({})).toBe(false);
    expect(isTextNode([])).toBe(false);
    expect(isTextNode(null)).toBe(false);
    expect(isTextNode(undefined)).toBe(false);
  });

  // Checks that only valid HTML attributes are accepted, including data attributes, and that invalid or disallowed attributes are rejected.
  test('isValidHtmlAttribute should validate HTML attributes', () => {
    expect(isValidHtmlAttribute('id')).toBe(true);
    expect(isValidHtmlAttribute('class')).toBe(true);
    expect(isValidHtmlAttribute('onclick')).toBe(false);
    expect(isValidHtmlAttribute('data-test')).toBe(true);
    expect(isValidHtmlAttribute('style')).toBe(true);
    expect(isValidHtmlAttribute('invalid-attr')).toBe(false);
  });
});
