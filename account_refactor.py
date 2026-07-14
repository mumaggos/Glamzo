import re

with open("src/pages/Account.tsx", "r") as f:
    text = f.read()

text = re.sub(
    r"const \[customDate, setCustomDate\] = useState\(''\);",
    "const [customStartDate, setCustomStartDate] = useState('');\n  const [customEndDate, setCustomEndDate] = useState('');",
    text
)

filter_logic = r"""    if \(dateFilter === 'intervalo' && customDate\) \{
      const cDate = new Date\(customDate\);
      cDate.setHours\(0,0,0,0\);
      const bDate = new Date\(bkDate\);
      bDate.setHours\(0,0,0,0\);
      return bDate.getTime\(\) === cDate.getTime\(\);
    \}
    
    return dateFilter === 'intervalo' && !customDate \? true : false;"""

new_filter_logic = """    if (dateFilter === 'intervalo') {
      if (!customStartDate && !customEndDate) return true;
      let start = customStartDate ? new Date(customStartDate) : new Date(0);
      let end = customEndDate ? new Date(customEndDate) : new Date(8640000000000000);
      start.setHours(0,0,0,0);
      end.setHours(23,59,59,999);
      const bDate = new Date(bkDate);
      return bDate >= start && bDate <= end;
    }
    return false;"""

text = re.sub(filter_logic, new_filter_logic, text)

jsx_logic = r"""\{dateFilter === 'intervalo' && \(
                  <input 
                    type="date" 
                    value=\{customDate\}
                    onChange=\{\(e\) => setCustomDate\(e\.target\.value\)\}
                    className="px-3 py-1\.5 rounded-full border border-slate-200 text-xs text-slate-700 outline-none focus:border-purple-500 bg-white"
                  />
                \)\}"""

new_jsx_logic = """{dateFilter === 'intervalo' && (
                  <div className="flex items-center gap-2">
                    <input 
                      type="date" 
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-700 outline-none focus:border-purple-500 bg-white"
                    />
                    <span className="text-slate-400 text-xs font-bold">até</span>
                    <input 
                      type="date" 
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-700 outline-none focus:border-purple-500 bg-white"
                    />
                  </div>
                )}"""

text = re.sub(jsx_logic, new_jsx_logic, text)

with open("src/pages/Account.tsx", "w") as f:
    f.write(text)
