import React from 'react';

interface LogoProps {
  className?: string;
  theme?: 'light' | 'dark';
  hideSubtext?: boolean;
}

export default function Logo({ className = 'h-16', theme = 'light', hideSubtext = false }: LogoProps) {
  // Color configuration based on theme
  const textColor = theme === 'light' ? '#0d7675' : '#38bdf8'; // Deep teal for light theme, sky-400/cyan for dark theme
  const subtextColor = theme === 'light' ? '#64748b' : '#94a3b8'; // Slate slate-500 vs slate-400

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 500 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full select-none"
      >
        {/* Background / Surrounding Floating Geometric Shapes (relicating the uploaded image) */}
        {/* Tilted light green triangle left of S */}
        <polygon
          points="60,40 80,60 55,75"
          fill="#86efac"
          opacity="0.85"
          transform="rotate(-15, 65, 55)"
        />
        
        {/* Small cyan/teal triangle below S */}
        <polygon
          points="45,90 55,100 40,105"
          fill="#2dd4bf"
          opacity="0.9"
          transform="rotate(10, 47, 97)"
        />

        {/* Small mint triangle under R-V junction */}
        <polygon
          points="200,95 215,115 195,110"
          fill="#a7f3d0"
          opacity="0.8"
          transform="rotate(-5, 205, 105)"
        />

        {/* Green triangle tilted above E-R */}
        <polygon
          points="180,25 200,35 185,45"
          fill="#4ade80"
          opacity="0.75"
          transform="rotate(25, 190, 35)"
        />

        {/* Light mint circle/dot above first O */}
        <circle
          cx="365"
          cy="48"
          r="7"
          fill="#a7f3d0"
          opacity="0.9"
        />

        {/* Big soft green triangle pointing down-right below OO */}
        <polygon
          points="360,95 390,120 355,125"
          fill="#bbf7d0"
          opacity="0.85"
          transform="rotate(-12, 370, 110)"
        />

        {/* Small cyan triangle near final O */}
        <polygon
          points="435,75 448,90 428,95"
          fill="#2dd4bf"
          opacity="0.85"
          transform="rotate(15, 438, 85)"
        />

        {/* Small cyan triangle under the middle I-X */}
        <polygon
          points="325,100 335,110 320,115"
          fill="#06b6d4"
          opacity="0.9"
          transform="rotate(-30, 327, 107)"
        />

        {/* Main Logo Text "SERVIXOO" */}
        <text
          x="250"
          y="80"
          textAnchor="middle"
          fill={textColor}
          fontSize="68"
          fontWeight="900"
          letterSpacing="0.04em"
          fontFamily="system-ui, -apple-system, sans-serif"
          className="transition-colors duration-300"
        >
          SERVIXOO
        </text>

        {/* AI • SKILLS • INDUSTRY ALIGNMENT Subtext */}
        {!hideSubtext && (
          <text
            x="250"
            y="122"
            textAnchor="middle"
            fill={subtextColor}
            fontSize="11"
            fontWeight="700"
            letterSpacing="0.24em"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            AI • SKILLS • INDUSTRY ALIGNMENT
          </text>
        )}
      </svg>
    </div>
  );
}
