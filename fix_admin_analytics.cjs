const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const badChunk = `                        )}
                      
                      </div>
              )}`;

const goodChunk = `                        )}
                      
                      </div>
                    </div>
                  </div>
                </div>
              )}`;

content = content.replace(badChunk, goodChunk);
fs.writeFileSync('src/pages/Admin.tsx', content);
console.log("Fixed analytics closure");
