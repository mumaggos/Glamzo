import re

with open("src/pages/Admin.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "CheckCircle,   Trash2, Award, Coins, Scale, Briefcase, BarChart, Settings, Mail, BadgeAlert, Plus,  X, Calendar, Clock, MapPin, Globe, ExternalLink, Menu, FileText, LogOut",
    "CheckCircle,   Trash2, Award, Coins, Scale, Briefcase, BarChart, Settings, Mail, BadgeAlert, Plus,  X, Calendar, Clock, MapPin, Globe, ExternalLink, Menu, FileText, LogOut, CreditCard, ArrowRightLeft, Package"
)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(content)
