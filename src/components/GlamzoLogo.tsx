import React from 'react';

interface GlamzoLogoProps {
  size?: number | string;
  withText?: boolean;
  showSquircle?: boolean;
  className?: string;
  glow?: boolean;
}

export default function GlamzoLogo({
  size = 36,
  withText = false,
  showSquircle = false,
  className = "",
  glow = true
}: GlamzoLogoProps) {
  
  // Custom styled CSS to ensure the laser beam shimmer and pulsing star play natively anywhere
  const customStyles = (
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes glamzoLaserSweep {
        0% { transform: translateX(-100%) skewX(-15deg); }
        50% { transform: translateX(100%) skewX(-15deg); }
        100% { transform: translateX(100%) skewX(-15deg); }
      }
      .anim-laser-sweep {
        animation: glamzoLaserSweep 3.5s cubic-bezier(0.25, 1, 0.5, 1) infinite;
      }
      @keyframes starSwell {
        0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.9; }
        50% { transform: scale(1.18) rotate(15deg); opacity: 1; filter: drop-shadow(0 0 4px #FBBF24); }
      }
      .anim-star-swell {
        animation: starSwell 3s ease-in-out infinite;
      }
    `}} />
  );

  return (
    <div id="glamzo-brand-logo-container" className={`inline-flex items-center gap-2.5 ${className}`}>
      {customStyles}
      
      <div 
        style={{ width: size, height: size }}
        className={`relative rounded-[22%] bg-gradient-to-br from-[#8B5CF6] via-[#6366F1] to-[#EC4899] flex items-center justify-center overflow-hidden hover:scale-105 transition-transform duration-300 group shrink-0 shadow-lg ${
          glow ? 'shadow-purple-950/50 border border-white/20' : 'border border-white/10'
        }`}
      >
        {/* Subtle background flow layer */}
        <div className="absolute inset-0 bg-[#0C0617]/15 group-hover:bg-transparent transition-colors duration-300" />
        
        {/* Beautiful high-end bold "G" text */}
        <span 
          className="font-display font-black text-white italic tracking-widest leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] select-none"
          style={{ 
            fontSize: typeof size === 'number' ? `${size * 0.52}px` : '18px',
            transform: 'translateY(-1%)'
          }}
        >
          G
        </span>

        {/* 4-Point Golden Star on the top right area of the logo */}
        <div 
          className="absolute anim-star-swell pointer-events-none"
          style={{
            top: '12%',
            right: '12%',
            width: typeof size === 'number' ? `${size * 0.25}px` : '9px',
            height: typeof size === 'number' ? `${size * 0.25}px` : '9px',
          }}
        >
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
            <path 
              d="M 50 10 Q 50 50, 90 50 Q 50 50, 50 90 Q 50 50, 10 50 Q 50 50, 50 10 Z" 
              fill="url(#goldStarGrad)" 
            />
            <defs>
              <linearGradient id="goldStarGrad" x1="10" y1="10" x2="90" y2="90">
                <stop offset="0%" stopColor="#FFF" />
                <stop offset="45%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Ambient background blur glow underneath */}
        <div className="absolute inset-0 rounded-[22%] bg-purple-500/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Lasersweep metallic shimmer reflection bar */}
        <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full anim-laser-sweep pointer-events-none" />
      </div>

      {withText && (
        <span className="text-lg font-display tracking-widest text-white font-semibold select-none">
          GLAMZO<span className="text-purple-400 font-extrabold animate-pulse">.</span>
        </span>
      )}
    </div>
  );
}
