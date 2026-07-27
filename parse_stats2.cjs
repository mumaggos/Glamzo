const fs = require('fs');
const content = fs.readFileSync('stats.html', 'utf8');
const match = content.match(/<script type="application\/json" id="data">([\s\S]*?)<\/script>/) || content.match(/const data = (.*?);/);
if (match) {
  try {
    const data = JSON.parse(match[1]);
    const nodes = [];
    function traverse(node, path) {
      if (node.children && node.children.length > 0) {
        node.children.forEach(c => traverse(c, path + '/' + (c.name || '')));
      } else {
        nodes.push({ name: path + '/' + node.name, size: node.size || node.renderedLength || 0 });
      }
    }
    traverse(data, data.name || '');
    nodes.sort((a, b) => b.size - a.size);
    console.log(nodes.slice(0, 30).map(n => n.name + ' - ' + n.size).join('\n'));
  } catch (e) {
    console.log("Error parsing JSON", e.message);
  }
} else {
  // Try another format: window.nodesData
  const match2 = content.match(/window\.nodesData\s*=\s*(.*?);<\/script>/) || content.match(/window\.nodesData\s*=\s*(.*?)$/m);
  if (match2) {
    try {
      const data = JSON.parse(match2[1]);
      const nodes = [];
      function traverse(node, path) {
        if (node.children && node.children.length > 0) {
          node.children.forEach(c => traverse(c, path + '/' + (c.name || '')));
        } else {
          nodes.push({ name: path + '/' + node.name, size: node.size || node.renderedLength || 0 });
        }
      }
      traverse(data, data.name || '');
      nodes.sort((a, b) => b.size - a.size);
      console.log(nodes.slice(0, 30).map(n => n.name + ' - ' + n.size).join('\n'));
    } catch (e) {
      console.log("Error parsing window.nodesData JSON", e.message);
    }
  } else {
    // Try to find ANY large JSON object in the html
    const matches = content.match(/\{"version":\d+,"tree":\{.*\}\}/);
    if (matches) {
       console.log("Found raw tree JSON");
       const data = JSON.parse(matches[0]);
       const nodes = [];
       function traverse(node, path) {
         if (node.children && node.children.length > 0) {
           node.children.forEach(c => traverse(c, path + '/' + (c.name || '')));
         } else {
           nodes.push({ name: path + '/' + node.name, size: node.size || node.renderedLength || node.gzipLength || 0 });
         }
       }
       traverse(data.tree, data.tree.name || '');
       nodes.sort((a, b) => b.size - a.size);
       console.log(nodes.slice(0, 30).map(n => n.name + ' - ' + n.size).join('\n'));
    } else {
       console.log("Could not find data in stats.html");
    }
  }
}
