import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    // If no language is specified, try to extract it from the code block
    if (!lang) {
      const codeBlockRegex = /```(\w+)/;
      const match = str.match(codeBlockRegex);
      if (match) {
        lang = match[1];
      }
    }

    // If a language is specified or detected, try to highlight the code
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {
        // Ignore any errors and fallback to default
      }
    }
    // Fallback to default auto-detection
    return hljs.highlightAuto(str).value;
  },
  // Use inline mode instead of block mode
  inline: true
});

function renderMarkdown(input) {
   // Render the input and remove the surrounding <p> and </p> tags
   const rendered = md.render(input).trim();
   if (rendered.startsWith('<p>') && rendered.endsWith('</p>')) {
     return rendered.slice(3, -4);
   }
   return rendered;
 }

window.renderMarkdown = renderMarkdown;







