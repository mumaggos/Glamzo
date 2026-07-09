const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf8');

text = text.replace(
`function GlobalRoleEnforcer() {
  const { user, profile, signOut, loading } = useAuth();
  const location = useLocation();`,
`function GlobalRoleEnforcer() {
  const { user, profile, signOut, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();`
);

text = text.replace(/window\.location\.href = '/g, "navigate('");
text = text.replace(/'\n/g, "', { replace: true })\n");

fs.writeFileSync('src/App.tsx', text);
