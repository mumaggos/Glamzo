with open("src/pages/Admin.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if "<span>Eliminar Conta</span>" in line:
        new_lines.append(line)
        new_lines.append("                                  </button>\n")
        new_lines.append("                                </div>\n")
        new_lines.append("                              </div>\n")
        new_lines.append("                            </div>\n")
        new_lines.append("                        );\n")
        new_lines.append("                      })}\n")
        new_lines.append("                  </div>\n")
        new_lines.append("                </div>\n")
        new_lines.append("              )}\n")
        skip = True
        continue
    if skip and "{/* ==================================================== */}" in line:
        skip = False
    
    if not skip:
        new_lines.append(line)

with open("src/pages/Admin.tsx", "w") as f:
    f.writelines(new_lines)
