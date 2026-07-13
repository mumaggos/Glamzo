with open("src/pages/Account.tsx", "r") as f:
    content = f.read()

import re
content = re.sub(
    r"(  const handleOpenDispute =.*?\}\;)(.*)(  const handleOpenDispute =.*?\}\;)",
    r"\1\2",
    content,
    flags=re.DOTALL
)

with open("src/pages/Account.tsx", "w") as f:
    f.write(content)
