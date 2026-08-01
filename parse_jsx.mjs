import fs from 'fs';
const code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const regex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
let match;
const stack = [];
const selfClosing = ['input', 'img', 'hr', 'br', 'meta', 'link', 'div', 'span']; // wait, div and span are not self-closing. We can just check for "/>" at the end of the tag.

while ((match = regex.exec(code)) !== null) {
  const fullTag = match[0];
  const tagName = match[1];
  
  if (fullTag.endsWith('/>')) {
    continue; // Self-closing
  }
  
  if (fullTag.startsWith('</')) {
    if (stack.length > 0 && stack[stack.length - 1].tagName === tagName) {
      stack.pop();
    } else {
      console.log(`Unmatched closing tag at index ${match.index}: ${fullTag}. Expected closing for ${stack.length > 0 ? stack[stack.length-1].tagName : 'nothing'}`);
    }
  } else {
    // Check if it's an HTML comment? 
    if (fullTag.startsWith('<!--')) continue;
    stack.push({ tagName, index: match.index, fullTag });
  }
}

if (stack.length > 0) {
  console.log("Unclosed tags:");
  for (const item of stack) {
    console.log(item.tagName, "at index", item.index, "line", code.substring(0, item.index).split('\n').length);
  }
} else {
  console.log("All tags matched!");
}
