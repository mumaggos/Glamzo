const fs = require('fs');
const content = fs.readFileSync('stats.html', 'utf8');
const match = content.match(/<script>window\.nodesData = (.*?)<\/script>/);
if (match) {
  const data = JSON.parse(match[1]);
  // We want to find the largest modules
  const nodes = [];
  function traverse(node, path) {
    if (node.children && node.children.length > 0) {
      node.children.forEach(c => traverse(c, path + '/' + node.name));
    } else {
      nodes.push({ name: path + '/' + node.name, size: node.size });
    }
  }
  traverse(data, '');
  nodes.sort((a, b) => b.size - a.size);
  console.log(nodes.slice(0, 20).map(n => n.name + ' - ' + n.size).join('\n'));
} else {
  // if not window.nodesData, it might be in a different format
  // newer rollup-plugin-visualizer versions have a script tag with type "application/json" or similar
  const match2 = content.match(/<script type="application\/json" id="data">([\s\S]*?)<\/script>/) || content.match(/const data = (.*?);/);
  if (match2) {
    console.log("Found data, need to parse differently");
    // let's try to just find the string
  }
}
