const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// I will locate the end of the Coupon Creator block which starts at:
// {/* Coupon Creator Interactive Console */}
// And ends where we see:
// {activeTab === 'support' && (
const startIndex = content.indexOf('{/* Coupon Creator Interactive Console */}');
const endIndex = content.indexOf('{activeTab === \'support\' && (');

if (startIndex !== -1 && endIndex !== -1) {
  let block = content.substring(startIndex, endIndex);
  
  // The block currently looks like:
  // {/* Coupon Creator ...
  // ...
  //                                 {cp.uses} / {cp.max_uses}
  //                               </span>
  //                             </div>
  //                           ))}
  //                         </div>
  //                       </div>
  //                     </div>
  //                   </div>
  //                 </div>
  //               </div>
  //             )}
  //             {/* ==================================================== */}
  //             {/* SECTION 4: DISPUTAS & TICKETS DE SUPORTE             */}
  //             {/* ==================================================== */}
  
  // We need to count the divs from the start of Coupon Creator to the end of the users tab.
  // The users tab starts with <div id="admin-users"...
  // The coupon creator is INSIDE that.
  // <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
  //   <h4 ...>
  //   <form> ... </form>
  //   <div className="space-y-2 mt-4">
  //     <span>...</span>
  //     <div className="space-y-1.5 max-h-[160px] overflow-y-auto scrollbar-thin">
  //        ...
  //     </div>
  //   </div>
  // </div>
  //
  // That's 3 closing divs needed.
  // Then the users tab itself needs:
  //     </div> (closes id="admin-users")
  //   )} (closes activeTab === 'users' &&)
  
  const correctEnding = `
                          </div>
                        </div>
                      </div>
                </div>
              )}
              {/* ==================================================== */}
              {/* SECTION 4: DISPUTAS & TICKETS DE SUPORTE             */}
              {/* ==================================================== */}
              `;
              
  // Replace the ending of the block
  const fixedBlock = block.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\}\)[\s\S]*?(?=\{\/\* ==================================================== \*\/)/, `</div>\n                        </div>\n                      </div>\n                </div>\n              )\n              `);
  
  content = content.replace(block, fixedBlock);
  fs.writeFileSync('src/pages/Admin.tsx', content);
  console.log("Fixed block in Admin.tsx");
}
