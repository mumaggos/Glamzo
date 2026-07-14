import re

with open("src/pages/Account.tsx", "r") as f:
    text = f.read()

target = """              {hasNotification && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}"""

replacement = """              {hasNotification && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
              )}"""

text = text.replace(target, replacement)

with open("src/pages/Account.tsx", "w") as f:
    f.write(text)
