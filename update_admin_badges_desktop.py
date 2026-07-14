import re
with open("src/pages/Admin.tsx", "r") as f:
    text = f.read()

target = r"""<Icon className="w-4\.5 h-4\.5 shrink-0" />
                  <span>\{tab\.label\}</span>
                </button>"""

replacement = """<Icon className="w-4.5 h-4.5 shrink-0" />
                  <span className="flex items-center gap-2">
                    {tab.label}
                    {tab.id === 'support' && disputes.some(d => d.status === 'open' || d.status === 'in_review') && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </span>
                </button>"""

text = re.sub(target, replacement, text)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(text)
