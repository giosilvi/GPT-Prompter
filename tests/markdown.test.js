let renderMarkdown;
beforeAll(async () => {
  global.window = {};
  ({ renderMarkdown } = await import('../src/markdown.js'));
});

describe('renderMarkdown', () => {
  test('strips surrounding paragraph tags', () => {
    const result = renderMarkdown('hello');
    expect(result).toBe('hello');
  });

  test('converts markdown formatting', () => {
    const result = renderMarkdown('**bold**');
    expect(result).toBe('<strong>bold</strong>');
  });
});
