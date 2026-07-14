sed -i '/const \[savingSeguranca, setSavingSeguranca\] = useState(false);/a \
  const [providers, setProviders] = useState<string[]>([]);\
\
  useEffect(() => {\
    supabase.auth.getUser().then(({ data }) => {\
      if (data.user?.app_metadata?.providers) {\
        setProviders(data.user.app_metadata.providers);\
      }\
    });\
  }, []);\
' src/pages/partner/tabs/SettingsTab.tsx
