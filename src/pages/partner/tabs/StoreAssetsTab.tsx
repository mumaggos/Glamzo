import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Copy, CheckCircle2, Globe, QrCode, Download } from "lucide-react";
import { Business } from "../../../types";
import { useTranslation } from "react-i18next";

interface PartnerContextType {
  business: Business | null;
}

export default function StoreAssetsTab() {
    const { t } = useTranslation();
  const { business } = useOutletContext<PartnerContextType>();
  const [copied, setCopied] = useState(false);

  if (!business) return null;

  const storeUrl = `https://glamzo.pt/${business.slug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const svg = document.getElementById("store-qr-code");
    if (!svg) return;
    
    let svgData = new XMLSerializer().serializeToString(svg);
    if (!svgData.includes("xmlns")) { svgData = svgData.replace("<svg", "<svg xmlns=\"http://www.w3.org/2000/svg\""); }
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_${business.name.replace(/\s+/g, '_')}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="animate-fade-in w-full max-w-4xl mx-auto space-y-8 text-slate-700 py-6">
      
      <div className="border-b border-slate-100 pb-5 text-left">
        <h3 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
          <Globe className="w-6 h-6 text-purple-500" />
          <span>Website & QR Code</span>
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          A sua página pública e ferramentas de partilha.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Link Section */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 flex flex-col items-center justify-center text-center gap-4 shadow-sm">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-2">
            <Globe className="w-8 h-8 text-purple-600" />
          </div>
          <h4 className="font-extrabold text-lg text-slate-900">Link da Loja</h4>
          <p className="text-sm text-slate-500 max-w-[250px]">
            Partilhe este link no seu Instagram, Facebook ou WhatsApp.
          </p>
          
          <div className="flex items-center gap-2 mt-4 w-full max-w-sm">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 truncate flex-1 select-all">
              {storeUrl}
            </div>
            <button
              onClick={copyToClipboard}
              className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl transition flex items-center justify-center shrink-0 shadow-sm"
              title="Copiar Link"
            >
              {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 flex flex-col items-center justify-center text-center gap-4 shadow-sm">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-2">
            <QrCode className="w-8 h-8 text-rose-600" />
          </div>
          <h4 className="font-extrabold text-lg text-slate-900">QR Code Oficial</h4>
          <p className="text-sm text-slate-500 max-w-[250px]">
            Imprima ou exiba no balcão para marcações rápidas.
          </p>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mt-2">
            <QRCodeSVG
              id="store-qr-code"
              value={storeUrl + "?source=qr"}
              size={140}
              level={"H"}
              includeMargin={false}
              fgColor={"#0f172a"}
            />
          </div>

          <button
            onClick={downloadQR}
            className="mt-2 text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-5 py-2.5 rounded-xl transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Descarregar QR Code
          </button>
          <div className="w-full bg-rose-50 border border-rose-100 rounded-xl p-4 mt-4 flex items-center justify-between">
            <div className="text-left">
              <span className="block text-[10px] font-black uppercase tracking-widest text-rose-500">QR Scans</span>
              <span className="text-xl font-black text-rose-700">{(business as any).qr_scans_count || 0}</span>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="block text-[10px] font-black uppercase tracking-widest text-purple-500">Page Views</span>
              <span className="text-xl font-black text-purple-700">{(business as any).page_views || 0}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
