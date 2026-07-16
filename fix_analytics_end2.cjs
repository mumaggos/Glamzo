const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const bad = `                        )}
                      
                      </div>
              )}
              {/* ==================================================== */}
              {/* SECTION 3: PAYOUTS`;

const good = `                        )}
                      
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* ==================================================== */}
              {/* SECTION 3: PAYOUTS`;

content = content.replace(bad, good);
fs.writeFileSync('src/pages/Admin.tsx', content);
console.log("Fixed analytics closure completely");
