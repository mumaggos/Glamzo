import re

with open("src/pages/Admin.tsx", "r") as f:
    content = f.read()

replacement = """                                </div>

                              </div>
                            </div>
                          </div>
                        );
                      })}"""

content = re.sub(
    r"                                <\/div>\s+<\/div>\s+<\/div>\s+\);\s+\}\)}\s+<\/div>",
    replacement + "\n                  </div>",
    content,
    flags=re.DOTALL
)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(content)

print("Patched closing div")
