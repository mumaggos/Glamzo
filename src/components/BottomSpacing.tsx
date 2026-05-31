import React from 'react';

export default function BottomSpacing() {
  return (
    <div 
      id="glamzo-bottom-navigation-safe-area" 
      className="w-full pointer-events-none select-none clear-both"
      style={{
        height: 'calc(130px + env(safe-area-inset-bottom, 16px))',
      }}
    />
  );
}
