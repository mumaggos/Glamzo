import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from "react-i18next";

export default function ContentLayout({ 
  title, 
  lastUpdated, 
  children 
}: { 
  title: string; 
  lastUpdated?: string;
  children: React.ReactNode; 
}) {
  return (
    <div className="pt-24 pb-16 bg-[#fafbfc] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">{title}</h1>
          {lastUpdated && (
            <p className="text-sm font-mono text-slate-500 mb-8 pb-8 border-b border-slate-200">
              Última atualização: {lastUpdated}
            </p>
          )}
          {!lastUpdated && <div className="mb-8 pb-8 border-b border-slate-200" />}
          
          <div className="prose prose-slate prose-purple max-w-none 
                          prose-headings:font-bold prose-headings:tracking-tight 
                          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                          prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-5
                          prose-ul:my-5 prose-li:my-1 prose-li:text-slate-600
                          prose-a:text-purple-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
