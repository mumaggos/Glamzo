import fs from 'fs';
let content = fs.readFileSync('src/components/partner/PartnerLayout.tsx', 'utf-8');

const targetImport = `import { LayoutDashboard, Calendar, CheckSquare, UsersRound, Users, Scissors, Clock, Tag, Landmark, Globe, MessageSquare, Smartphone, Settings, LogOut, X, Menu, Bell, CreditCard } from "lucide-react";`;
const replacementImport = `import { LayoutDashboard, Calendar, CheckSquare, UsersRound, Users, Scissors, Clock, Tag, Landmark, Globe, MessageSquare, Smartphone, Settings, LogOut, X, Menu, Bell, CreditCard, Star } from "lucide-react";`;
content = content.replace(targetImport, replacementImport);

const targetNav = `{ id: "horarios", label: "Horários", icon: Clock, path: "/partner/dashboard/horarios" },`;
const replacementNav = `{ id: "horarios", label: "Horários", icon: Clock, path: "/partner/dashboard/horarios" },
    { id: "avaliacoes", label: "Avaliações", icon: Star, path: "/partner/dashboard/avaliacoes" },`;
content = content.replace(targetNav, replacementNav);

fs.writeFileSync('src/components/partner/PartnerLayout.tsx', content);
