import re

with open("src/pages/Admin.tsx", "r") as f:
    text = f.read()

# Update mobile sidebar
target_mobile = r"\{tab\.label\}"
replacement_mobile = """{tab.label}
                    {tab.id === 'support' && disputes.some(d => d.status === 'open' || d.status === 'in_review') && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-2" title="Disputas Pendentes" />
                    )}"""
# Wait, this would replace all {tab.label}. Let's be more precise.

target1 = r"""<Icon className="w-4 h-4 shrink-0" />
                    <span>\{tab\.label\}</span>
                  </button>"""

replacement1 = """<Icon className="w-4 h-4 shrink-0" />
                    <span className="flex items-center gap-2">
                      {tab.label}
                      {tab.id === 'support' && disputes.some(d => d.status === 'open' || d.status === 'in_review') && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </span>
                  </button>"""

text = re.sub(target1, replacement1, text)

target2 = r"""<tab\.icon className="w-4 h-4 shrink-0" /> 
                    <span>\{tab\.label\}</span>
                  </button>"""

replacement2 = """<tab.icon className="w-4 h-4 shrink-0" /> 
                    <span className="flex items-center gap-2">
                      {tab.label}
                      {tab.id === 'support' && disputes.some(d => d.status === 'open' || d.status === 'in_review') && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </span>
                  </button>"""

text = re.sub(target2, replacement2, text)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(text)
