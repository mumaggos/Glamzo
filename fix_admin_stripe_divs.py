with open("src/pages/Admin.tsx", "r") as f:
    content = f.read()

import re
content = re.sub(
    r"                    <\/div>\n                  <\/div>\n                  <\/div>\n                <\/div>\n              \)}\n              \{eliteTab === 'catalog'",
    "                    </div>\n                  </div>\n                </div>\n              )}\n              {eliteTab === 'catalog'",
    content
)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(content)
