with open("src/pages/Account.tsx", "r") as f:
    lines = f.readlines()

out = []
skip = False
for i, line in enumerate(lines):
    if "                })}" in line:
        out.append(line)
        out.append("              </div>\n")
        out.append("            )}\n")
        out.append("          </div>\n")
        out.append("        )}\n")
        out.append("\n")
        skip = True
        continue
    if skip and "{/* 2. ABA DE PERFIL */}" in line:
        skip = False
    
    if not skip:
        out.append(line)

with open("src/pages/Account.tsx", "w") as f:
    f.writelines(out)

