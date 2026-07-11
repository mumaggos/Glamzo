import fs from 'fs';
let content = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf-8');

const targetState = `const [showReviewsModal, setShowReviewsModal] = useState(false);`;
content = content.replace(targetState, '');

const targetClick = `onClick={() => setShowReviewsModal(true)}`;
const replacementClick = `onClick={() => setActiveTab('avaliacoes')}`;
content = content.replace(targetClick, replacementClick);

const targetModalStart = `{showReviewsModal && (`;
const targetModalEnd = `      )}
    </div>`;

// We will just do a regex replace to remove the modal completely
// Let's do it safely
const modalRegex = /\{showReviewsModal && \([\s\S]*?\}\)/g;
content = content.replace(modalRegex, '');

fs.writeFileSync('src/components/DashboardOverview.tsx', content);
