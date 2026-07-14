sed -i '/const \[successMsg, setSuccessMsg\] = useState<string | null>(null);/a \
  const [providers, setProviders] = useState<string[]>([]);\
  const [newPassword, setNewPassword] = useState("");\
  const [savingPassword, setSavingPassword] = useState(false);\
  const [passwordMsg, setPasswordMsg] = useState<{type: "error" | "success", text: string} | null>(null);\
\
  useEffect(() => {\
    supabase.auth.getUser().then(({ data }) => {\
      if (data.user?.app_metadata?.providers) {\
        setProviders(data.user.app_metadata.providers);\
      }\
    });\
  }, []);\
\
  const handleUpdatePassword = async (e: React.FormEvent) => {\
    e.preventDefault();\
    if (newPassword.length < 6) {\
      setPasswordMsg({ type: "error", text: "A password deve ter pelo menos 6 caracteres." });\
      return;\
    }\
    setSavingPassword(true);\
    setPasswordMsg(null);\
    try {\
      const { error } = await supabase.auth.updateUser({ password: newPassword });\
      if (error) throw error;\
      setPasswordMsg({ type: "success", text: "Password atualizada com sucesso." });\
      setNewPassword("");\
    } catch (err: any) {\
      setPasswordMsg({ type: "error", text: err.message || "Erro ao atualizar password." });\
    } finally {\
      setSavingPassword(false);\
    }\
  };\
' src/pages/Account.tsx
