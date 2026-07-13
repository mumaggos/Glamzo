import re

with open("src/pages/Admin.tsx", "r") as f:
    content = f.read()

content = re.sub(
    r"\{\/\* ==================================================== \*\/\}\s+\{\/\* SECTION 2: LOJAS PARCEIRAS \(VERIFICATION TOGGLES\).*?\{\/\* ==================================================== \*\/\}\s+\{\/\* SECTION 3: PAYOUTS",
    "{/* ==================================================== */}\n              {/* SECTION 3: PAYOUTS",
    content,
    flags=re.DOTALL
)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(content)

print("Patched section 2")
