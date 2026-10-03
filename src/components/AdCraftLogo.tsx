import React from 'react';

interface AdCraftLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  badgeText?: string;
}

export const AdCraftLogo: React.FC<AdCraftLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  badgeText = 'STUDIO'
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11'
  }[size];

  const titleSizes = {
    sm: 'text-base',
    md: 'text-[17px]',
    lg: 'text-xl'
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Vector Monogram */}
      <div
        className={`relative ${iconDimensions} rounded-xl bg-gradient-to-b from-[#141824] to-[#0A0D15] p-0.5 ring-1 ring-white/[0.12] shadow-[0_2px_12px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.15)] flex items-center justify-center group overflow-hidden`}
      >
        {/* Ambient Backlight Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/30 via-transparent to-cyan-400/25 opacity-70 group-hover:opacity-100 transition-opacity" />

        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1 relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
        >
          <defs>
            <linearGradient id="adcraft-grad-left" x1="4" y1="4" x2="20" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#4338CA" />
            </linearGradient>
            <linearGradient id="adcraft-grad-right" x1="16" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="adcraft-grad-core" x1="12" y1="12" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#A5B4FC" />
            </linearGradient>
            <filter id="adcraft-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Left Isometric A-Apex Facet */}
          <path
            d="M18 5L7 27H13L15.8 21.4H20.2L18 17H16.5L18 14L22 21.4H29L18 5Z"
            fill="url(#adcraft-grad-left)"
          />

          {/* Right Kinetic Canvas Frame Overlap */}
          <path
            d="M23.5 12.5L29 27H23L21.4 23H17.8L20 18.5H22.5L19.5 12.5H23.5Z"
            fill="url(#adcraft-grad-right)"
            fillOpacity="0.9"
          />

          {/* Core Kinetic Synthesis Prism Aperture */}
          <polygon
            points="18,13 21.5,20 14.5,20"
            fill="url(#adcraft-grad-core)"
            filter="url(#adcraft-glow)"
            className="animate-pulse"
          />

          {/* Specular Edge Highlights */}
          <line x1="18" y1="5.5" x2="7.5" y2="26.5" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="18" y1="5.5" x2="28.5" y2="26.5" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" strokeLinecap="round" />
        </svg>
      </div>

      {/* Brand Typography & Studio Pill */}
      {showText && (
        <div className="flex items-center gap-1.5 leading-none">
          <div className="flex items-baseline font-['Geist'] tracking-tight">
            <span className={`${titleSizes} font-black text-white tracking-[-0.03em]`}>
              Ad
            </span>
            <span className={`${titleSizes} font-black bg-gradient-to-r from-indigo-300 via-indigo-100 to-cyan-300 bg-clip-text text-transparent tracking-[-0.03em]`}>
              Craft
            </span>
          </div>

          {badgeText && (
            <span className="ml-1 px-1.5 py-0.5 rounded-md text-[9px] font-['JetBrains_Mono'] font-bold tracking-widest uppercase bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 shadow-[0_0_8px_rgba(99,102,241,0.15)]">
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
