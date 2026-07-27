import re
import json

with open("stats.html", "r", encoding="utf-8") as f:
    html = f.read()

match = re.search(r'const defaultData\s*=\s*(\{.*?\});', html, re.DOTALL)
if match:
    data = json.loads(match.group(1))
    
    def process_node(node, path):
        sz = node.get("size", node.get("renderedLength", 0))
        if sz > 0:
            print(f"{path}: {sz/1024:.2f} KB")
        if "children" in node:
            for c in node["children"]:
                process_node(c, path + "/" + c.get("name", ""))

    for c in data.get("children", []):
        process_node(c, c.get("name", ""))
