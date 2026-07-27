import re
import json

with open("stats.html", "r", encoding="utf-8") as f:
    html = f.read()

# Try to find the script containing the data
match = re.search(r'window\.nodesData\s*=\s*(.*?);</script>', html, re.DOTALL)
if not match:
    match = re.search(r'const data = (.*?);', html, re.DOTALL)
if not match:
    match = re.search(r'<script type="application/json" id="data">(.*?)</script>', html, re.DOTALL)
if not match:
    # the new rollup-plugin-visualizer has:
    # <script>
    #   const defaultData = {...}
    match = re.search(r'const defaultData\s*=\s*(\{.*?\});', html, re.DOTALL)
if not match:
    # maybe just search for the first huge json object
    match = re.search(r'\{"version":\d+,"tree":\{.*?\}\}', html, re.DOTALL)

if match:
    data_str = match.group(1) if match.lastindex else match.group(0)
    try:
        data = json.loads(data_str)
        nodes = []
        def traverse(node, path):
            if "children" in node and node["children"]:
                for c in node["children"]:
                    traverse(c, path + "/" + c.get("name", ""))
            else:
                nodes.append((path + "/" + node.get("name", ""), node.get("size", node.get("renderedLength", 0))))
        
        # sometimes it's wrapped in 'tree'
        if "tree" in data:
            traverse(data["tree"], data["tree"].get("name", ""))
        else:
            traverse(data, data.get("name", ""))
            
        nodes.sort(key=lambda x: x[1], reverse=True)
        for name, size in nodes[:40]:
            print(f"{name}: {size/1024:.2f} KB")
    except Exception as e:
        print("Error parsing json:", e)
else:
    print("No data found")
