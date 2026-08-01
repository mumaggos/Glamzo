import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

// Add groupedTimezones
if (!code.includes('const groupedTimezones')) {
    code = code.replace(
        "const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Lisbon');",
        "const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Lisbon');\n  const groupedTimezones = useMemo(() => {\n    const tzs = (Intl as any).supportedValuesOf('timeZone');\n    const groups: Record<string, string[]> = {};\n    tzs.forEach((tz: string) => {\n      const parts = tz.split('/');\n      const group = parts.length > 1 ? parts[0] : 'Outros';\n      if (!groups[group]) groups[group] = [];\n      groups[group].push(tz);\n    });\n    return groups;\n  }, []);"
    );
}

// Add getCurrencyWarning
if (!code.includes('const getCurrencyWarning')) {
    code = code.replace(
        "const [currency, setCurrency] = useState('EUR');",
        "const [currency, setCurrency] = useState('EUR');\n  const getCurrencyWarning = () => {\n    const c = country.toLowerCase().trim();\n    if (['portugal', 'espanha', 'frança', 'france', 'spain', 'italia', 'italy', 'alemanha', 'germany'].includes(c) && currency !== 'EUR') {\n      return 'Aviso: O Stripe normalmente exige liquidações em EUR para países da Zona Euro.';\n    }\n    if (['reino unido', 'uk', 'united kingdom'].includes(c) && currency !== 'GBP') {\n      return 'Aviso: O Stripe normalmente exige liquidações em GBP para o Reino Unido.';\n    }\n    if (['brasil', 'brazil'].includes(c) && currency !== 'BRL') {\n      return 'Aviso: Contas Stripe no Brasil exigem liquidações em BRL.';\n    }\n    if (['estados unidos', 'usa', 'united states', 'us'].includes(c) && currency !== 'USD') {\n      return 'Aviso: Contas Stripe nos EUA exigem liquidações em USD.';\n    }\n    return null;\n  };\n  const currencyWarning = getCurrencyWarning();"
    );
}

// Update the timezone select
code = code.replace(
    /\{\(Intl as any\)\.supportedValuesOf\('timeZone'\)\.map\(tz => \(\s*<option key=\{tz\} value=\{tz\}>\{tz\}<\/option>\s*\)\)\}/,
    `{Object.entries(groupedTimezones).map(([group, tzs]) => (
                    <optgroup key={group} label={group}>
                      {(tzs as string[]).map(tz => {
                        const label = tz.split('/').slice(1).join('/') || tz;
                        return <option key={tz} value={tz}>{label.replace(/_/g, ' ')}</option>;
                      })}
                    </optgroup>
                  ))}`
);

// Update currency select to show warning
code = code.replace(
    /<select value=\{currency\}.*?<\/select>/s,
    `$&
                {currencyWarning && (
                  <div className="mt-2 text-xs font-medium text-amber-600 bg-amber-50 p-2 rounded flex items-start gap-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{currencyWarning}</span>
                  </div>
                )}`
);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
