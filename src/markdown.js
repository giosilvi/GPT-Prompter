import MarkdownIt from 'markdown-it';
import katex from 'katex';
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

function renderFunctionsInRegex(rendered, regex) {
  // console.log("Regex: ", regex);
  // Map of equation to rendered HTML
  let equations = {};
  let matches = rendered.match(regex)
  if (matches){
    matches.forEach((equation) => {
      let katexEquation = equation;
      if (equation.length < 3) return; // Ignore empty equations (e.g. \( \))
      equation = equation.trim(); // Remove leading and trailing whitespace
      // Remove the surrounding $ or $$ or \( \) or \[ \]
      if (equation.startsWith('\\(') && equation.endsWith('\\)')) {
        // get rid of the slashes before the parentheses
        katexEquation = equation.slice(2, -2);
        // equation = equation.replace('\\(', '(').replace('\\)', ')');
        // equation = equation.replaceAll('\\\\', '\\');
        // equation = equation.replaceAll(' \n', '\n');
        equation = md.render(equation).trim();
        if (equation.startsWith('<p>') && equation.endsWith('</p>')) {
          equation = equation.slice(3, -4);
        }
        try {
          equations[equation] = katex.renderToString(katexEquation, {
            throwOnError: false,
            displayMode: false,
            output: 'mathml'
          });
        }
        catch (error) {
          equations[equation] = `<span style="color: red;">${error.message}</span>`;
        }
      }
      else if (equation.startsWith('\\[') && equation.endsWith('\\]')) {
        katexEquation = equation.slice(2, -2);
        // equation = equation.replace('\\[', '[').replace('\\]', ']');
        // equation = equation.replaceAll('\\\\', '\\');
        // equation = equation.replaceAll(' \n', '\n');
        equation = md.render(equation).trim();
        if (equation.startsWith('<p>') && equation.endsWith('</p>')) {
          equation = equation.slice(3, -4);
        }
        try {
          equations[equation] = katex.renderToString(katexEquation, {
            throwOnError: false,
            displayMode: true,
            output: 'mathml'
          });
        }
        catch (error) {
          equations[equation] = `<span style="color: red;">${error.message}</span>`;
        }
      }
      // console.log("Equation: ", equation);
      // console.log("Rendered equation: ", katexEquation);
    });
  }

  return equations;
}
function renderMarkdown(input) {
  // console.log("renderMarkdown called.");
  // Find math equations
  // console.log("Original:", input);
  let regexes = [
    /\$\$(.*?)\$\$/g, // Double dollar signs
    /\$(.*?)\$/g, // Single dollar signs
    /\\\((.*?)\\\)/g, // Parentheses with backslashes before them
    // Brackets with backslashes before them - doesn't have to end on the same line
    // Grab including newlines
    /\\\[(.|\n)*?\\\]/g,
  ]

  let allEquations = {};
  for (let regex of regexes) {
    let equations = renderFunctionsInRegex(input, regex);
    allEquations = {...allEquations, ...equations};
  }
  // console.log("All equations: ", allEquations);
  // Render the input and remove the surrounding <p> and </p> tags
  var rendered = md.render(input).trim();
  if (rendered.startsWith('<p>') && rendered.endsWith('</p>')) {
    rendered = rendered.slice(3, -4);
  }

  // Replace all the equations in the rendered HTML
  for (let equation in allEquations) {
    rendered = rendered.replaceAll(equation, allEquations[equation]);
  }

  return rendered;
 }

window.renderMarkdown = renderMarkdown;