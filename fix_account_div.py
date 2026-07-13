with open("src/pages/Account.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if i == 388:
        new_lines.append("              </div>\n")
        continue
    if i == 389:
        new_lines.append("            )}\n")
        continue
    if i == 390:
        new_lines.append("          </div>\n")
        continue
    if i == 391:
        new_lines.append("        )}\n")
        continue
    if i == 392:
        continue # skip
    new_lines.append(line)

with open("src/pages/Account.tsx", "w") as f:
    f.writelines(new_lines)
