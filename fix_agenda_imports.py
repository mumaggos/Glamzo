import re

with open("src/pages/partner/tabs/AgendaTab.tsx", "r") as f:
    text = f.read()

text = text.replace(
    "import { Calendar, Sparkles, X, Bell, Plus, CheckCircle, Trash2, ChevronLeft, ChevronRight } from \"lucide-react\";",
    "import { Calendar, Sparkles, X, Bell, Plus, CheckCircle, Trash2, ChevronLeft, ChevronRight, ShieldAlert, Loader2 } from \"lucide-react\";"
)

with open("src/pages/partner/tabs/AgendaTab.tsx", "w") as f:
    f.write(text)

