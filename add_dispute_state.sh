sed -i '/const \[selectedDispute, setSelectedDispute\] = useState<Dispute | null>(null);/a \
  const [messages, setMessages] = useState<any[]>([]);\
  const [newMessage, setNewMessage] = useState("");\
  const [uploadingImage, setUploadingImage] = useState(false);\
  const messagesEndRef = useRef<HTMLDivElement>(null);\
  \
  useEffect(() => {\
    if (!selectedDispute) return;\
    \
    const fetchMessages = async () => {\
      const { data } = await supabase\
        .from("dispute_messages")\
        .select("*")\
        .eq("dispute_id", selectedDispute.id)\
        .order("created_at", { ascending: true });\
      if (data) setMessages(data);\
    };\
    fetchMessages();\
\
    const channel = supabase.channel(`dispute_${selectedDispute.id}`)\
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "dispute_messages", filter: `dispute_id=eq.${selectedDispute.id}` }, (payload) => {\
        setMessages(prev => [...prev, payload.new]);\
      })\
      .subscribe();\
\
    return () => {\
      supabase.removeChannel(channel);\
    };\
  }, [selectedDispute]);\
\
  useEffect(() => {\
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });\
  }, [messages]);\
\
  const handleSendMessage = async (e?: React.FormEvent) => {\
    e?.preventDefault();\
    if (!newMessage.trim() || !selectedDispute) return;\
    \
    const content = newMessage;\
    setNewMessage("");\
    \
    await supabase.from("dispute_messages").insert({\
      dispute_id: selectedDispute.id,\
      sender_type: myType,\
      sender_id: myId,\
      content: content\
    });\
  };\
\
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {\
    const file = e.target.files?.[0];\
    if (!file || !selectedDispute) return;\
    \
    setUploadingImage(true);\
    try {\
      const fileExt = file.name.split(".").pop();\
      const fileName = `${Math.random()}.${fileExt}`;\
      const filePath = `disputes/${selectedDispute.id}/${fileName}`;\
      \
      const { error: uploadError } = await supabase.storage\
        .from("businesses")\
        .upload(filePath, file);\
        \
      const { data: publicUrlData } = supabase.storage.from("businesses").getPublicUrl(filePath);\
      \
      await supabase.from("dispute_messages").insert({\
        dispute_id: selectedDispute.id,\
        sender_type: myType,\
        sender_id: myId,\
        content: "Anexo de Imagem",\
        file_url: publicUrlData.publicUrl\
      });\
    } catch (err) {\
      console.error(err);\
    } finally {\
      setUploadingImage(false);\
    }\
  };\
' src/components/UniversalDisputes.tsx
