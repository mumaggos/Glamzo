with open("src/components/UniversalDisputes.tsx", "r") as f:
    text = f.read()

text = text.replace(
    "dispute.status === 'open' ? 'text-rose-500' :\n                    dispute.status === 'in_review' ? 'text-amber-500' : 'text-emerald-500'",
    "dispute.status === 'open' ? 'text-amber-500' :\n                    dispute.status === 'in_review' ? 'text-blue-500' : 'text-emerald-500'"
)

text = text.replace(
    "dispute.status === 'open' ? 'bg-rose-100 text-rose-700' :\n                  dispute.status === 'in_review' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'",
    "dispute.status === 'open' ? 'bg-amber-100 text-amber-700' :\n                  dispute.status === 'in_review' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'"
)

text = text.replace(
    "selectedDispute.status === 'open' ? 'bg-rose-100 text-rose-700' :\n                  selectedDispute.status === 'in_review' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'",
    "selectedDispute.status === 'open' ? 'bg-amber-100 text-amber-700' :\n                  selectedDispute.status === 'in_review' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'"
)

with open("src/components/UniversalDisputes.tsx", "w") as f:
    f.write(text)
