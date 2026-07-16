const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const badChunk = `                            {couponsList.map((cp) => (
                              <div key={cp.code} className="p-2.5 bg-slate-50 rounded-xl border border-slate-910 flex items-center justify-between text-[11px] font-mono text-slate-600">
                                <div className="text-left">
                                  <span className="text-slate-900 font-black">{cp.code}</span>
                                  <span className="block text-[9px] text-slate-500">{cp.trial_days} dias experimental • Max: {cp.max_uses}</span>
                                </div>
                                <span className="bg-purple-950 text-purple-600 border border-purple-900 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                  {cp.uses} / {cp.max_uses}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}`;

const goodChunk = `                            {couponsList.map((cp) => (
                              <div key={cp.code} className="p-2.5 bg-slate-50 rounded-xl border border-slate-910 flex items-center justify-between text-[11px] font-mono text-slate-600">
                                <div className="text-left">
                                  <span className="text-slate-900 font-black">{cp.code}</span>
                                  <span className="block text-[9px] text-slate-500">{cp.trial_days} dias experimental • Max: {cp.max_uses}</span>
                                </div>
                                <span className="bg-purple-950 text-purple-600 border border-purple-900 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                  {cp.uses} / {cp.max_uses}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                </div>
              )}`;

if (content.includes(badChunk)) {
  content = content.replace(badChunk, goodChunk);
  fs.writeFileSync('src/pages/Admin.tsx', content);
  console.log("Fixed chunk 1");
} else {
  console.log("Chunk not found.");
}
