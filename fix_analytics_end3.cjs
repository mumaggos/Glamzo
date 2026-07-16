const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const anchor = `Os dados serão apresentados após atividade real.</p>
                          </div>
                        )}
                      
                      </div>
              )}
              {/* ==================================================== */}
              {/* SECTION 3: PAYOUTS & PLANÁRIOS DE PREÇOS             */}
              {/* ==================================================== */}
              {activeTab === 'sales_teams' && <SalesAgentsTab />}`;

const replacement = `Os dados serão apresentados após atividade real.</p>
                          </div>
                        )}
                      
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* ==================================================== */}
              {/* SECTION 3: PAYOUTS & PLANÁRIOS DE PREÇOS             */}
              {/* ==================================================== */}
              {activeTab === 'sales_teams' && <SalesAgentsTab />}`;

if (content.indexOf(anchor) !== -1) {
  content = content.replace(anchor, replacement);
  fs.writeFileSync('src/pages/Admin.tsx', content);
  console.log("Replaced via exact anchor!");
} else {
  console.log("Anchor not found. Let's do regex");
  content = content.replace(/Os dados serão apresentados após atividade real\.<\/p>\s*<\/div>\s*\}\)\s*<\/div>\s*\}\)\s*\{\/\* ==/s, `Os dados serão apresentados após atividade real.</p>\n                          </div>\n                        )}\n                      \n                      </div>\n                    </div>\n                  </div>\n                </div>\n              )}\n              {/* ==`);
  fs.writeFileSync('src/pages/Admin.tsx', content);
}

