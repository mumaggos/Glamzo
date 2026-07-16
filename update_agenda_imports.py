import re

with open("src/pages/partner/tabs/AgendaTab.tsx", "r") as f:
    text = f.read()

text = text.replace("import { DashboardCalendar }", "import { processBookingPoints } from '../../../utils/rewardsHelper';\nimport { DashboardCalendar }")

with open("src/pages/partner/tabs/AgendaTab.tsx", "w") as f:
    f.write(text)
