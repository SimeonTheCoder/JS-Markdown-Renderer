# A JS Markdown Parser

```ad-info
This project can take `Markdown` files and render them. Why? *Because why not!*
```

## Supported features

It's still in early phases of development. Here are the currently supported features:

- Headers with different levels
- Blocks
    - Inline code
    - Code with syntax highlighting
    - Admonition blocks
- **Bold** & *Italic*, ==Marker==
- Lists
- HTML tags, including inline `CSS` and `JS`

==Example Usage:==

```js
import { parseMarkdown } from './markdown-renderer.js';

const str = await parseMarkdown('file.md');
document.querySelector('markdownContainer').innerHTML = str;

let d = 7;

console.log('a' + d + 'b');
```

# ==GIFs== and images, why not!

<img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fbestanimations.com%2FAnimals%2FMammals%2FDolphins%2Fdolphin%2Fdolphin-jumping-animated-gif-4.gif&f=1&nofb=1&ipt=939a9d194bb236a4fb85d9b017d3c4a3f6e690beb9969d83dadcfcbd3d87103f">

<button style="background-color: black; color: white; padding: 20px; border: 0px; border-radius: 20px" onclick="(() => {alert('JS also works!')})()">Press me 👉👈</button>

<style>body{background: linear-gradient(#442222, #222244); color: white;}</style>
