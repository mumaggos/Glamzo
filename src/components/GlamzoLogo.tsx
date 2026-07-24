import React from 'react';

interface GlamzoLogoProps {
  size?: number | string;
  withText?: boolean;
  showSquircle?: boolean;
  className?: string;
  glow?: boolean;
  forceDark?: boolean;
}

export default function GlamzoLogo({
  size = 36,
  withText = false,
  showSquircle = false,
  className = "",
  glow = true,
  forceDark = false
}: GlamzoLogoProps) {
  
  const customStyles = (
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes glamzoPulseTech {
        0% { transform: rotate(0deg); opacity: 0.8; }
        50% { opacity: 1; }
        100% { transform: rotate(360deg); opacity: 0.8; }
      }
      .anim-tech-pulse {
        animation: glamzoPulseTech 4s linear infinite;
        transform-origin: center;
      }
      @keyframes neonGlow {
        0%, 100% { box-shadow: 0 0 10px rgba(139,92,246,0.3), inset 0 0 10px rgba(139,92,246,0.3); }
        50% { box-shadow: 0 0 25px rgba(139,92,246,0.6), inset 0 0 15px rgba(139,92,246,0.5); }
      }
      .glamzo-glow-container {
        animation: neonGlow 3s ease-in-out infinite;
      }
    `}} />
  );

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {customStyles}
      
      <div 
        style={{ width: size, height: size }}
        className={`relative flex items-center justify-center shrink-0 ${
          showSquircle ? 'rounded-2xl bg-slate-950 border border-slate-800' : ''
        }`}
      >
        {glow && (
          <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
        )}
        
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          className="w-full h-full relative z-10 hover:scale-105 transition-transform duration-300"
        >
          {/* Outer Ring / Track */}
          <circle 
            cx="50" 
            cy="50" 
            r="42" 
            stroke="url(#glamzoGradientLight)" 
            strokeWidth="3" 
            className="opacity-20"
          />
          
          {/* Orbiting / Animated Tech Arc */}
          <circle 
            cx="50" 
            cy="50" 
            r="42" 
            stroke="url(#glamzoGradient)" 
            strokeWidth="4" 
            strokeLinecap="round"
            strokeDasharray="140 120"
            className="anim-tech-pulse"
          />

          {/* Core Tech G Shape */}
          <path
            d="M65,35 L45,35 A15,15 0 0,0 45,65 L60,65 L60,50 L50,50"
            stroke="url(#glamzoGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-lg"
          />
          
          {/* Tech Nodes */}
          <circle cx="65" cy="35" r="4" fill="#E879F9" />
          <circle cx="50" cy="50" r="3" fill="#ffffff" className="animate-pulse" />

          <defs>
            <linearGradient id="glamzoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333EA" />   {/* Purple */}
              <stop offset="50%" stopColor="#A855F7" />  {/* Lighter Purple */}
              <stop offset="100%" stopColor="#E879F9" /> {/* Pinkish */}
            </linearGradient>
            <linearGradient id="glamzoGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#F472B6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {withText && (
        <span className={`text-xl font-display font-black tracking-[0.2em] uppercase leading-none drop-shadow-sm ${forceDark ? 'text-slate-900' : 'text-slate-100'}`}>
          Glamzo<span className="text-purple-500 font-black">.</span>
        </span>
      )}
    </div>
  );
}
