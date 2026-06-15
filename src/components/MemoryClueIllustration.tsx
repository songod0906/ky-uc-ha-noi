import React from 'react';

interface ClueIllustrationProps {
  clueId: string;
  color?: string;
  className?: string;
}

export function MemoryClueIllustration({ clueId, color = '#C8A882', className = '' }: ClueIllustrationProps) {
  const svgProps = {
    width: "100%",
    height: "100%",
    viewBox: "0 0 64 64",
    fill: "none",
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: `w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] transition-colors duration-300 ${className}`,
  };

  switch (clueId) {
    case 'trang-an-vat': // Lemon ice cream & snack stall
      return (
        <svg {...svgProps}>
          <path d="M32 44v12M28 56h8" strokeWidth="2.5" />
          <path d="M18 28c0-10 14-14 14-14s14 4 14 14v4H18v-4z" fill={`${color}15`} />
          <path d="M18 32h28v4a8 8 0 01-16 0v-4" />
          <path d="M22 38c0 3 6 3 6 0" />
          <circle cx="32" cy="18" r="3" fill={color} />
        </svg>
      );
    case 'trang-tieng-trong': // School drum
      return (
        <svg {...svgProps}>
          <ellipse cx="32" cy="20" rx="16" ry="7" fill={`${color}20`} />
          <path d="M16 20v22c0 3.8 7.2 7 16 7s16-3.2 16-7V20" />
          <ellipse cx="32" cy="40" rx="16" ry="7" strokeDasharray="3 3" />
          <path d="M22 13l10 14M42 13L32 27" strokeWidth="2.5" />
        </svg>
      );
    case 'trang-tieng-chui': // CRT monitor
      return (
        <svg {...svgProps}>
          <rect x="10" y="10" width="44" height="32" rx="4" fill={`${color}10`} />
          <rect x="14" y="14" width="36" height="24" rx="2" />
          <path d="M20 42l-4 10h32l-4-10" />
          <path d="M24 52h16" />
          <path d="M18 20h28M18 26h28M18 32h28" strokeWidth="1" opacity="0.3" strokeDasharray="2 2" />
        </svg>
      );
    case 'trang-choi-net': // Net cafe game controller / keyboard
      return (
        <svg {...svgProps}>
          <rect x="12" y="18" width="40" height="28" rx="8" fill={`${color}10`} />
          <circle cx="22" cy="32" r="3.5" />
          <path d="M22 28v8M18 32h8" />
          <circle cx="42" cy="28" r="2" fill={color} />
          <circle cx="42" cy="36" r="2" fill={color} />
          <path d="M28 46c0 3-2 5-4 5s-4-2-4-5h8zm16 0c0 3 2 5 4 5s4-2 4-5h-8z" />
        </svg>
      );
    case 'trang-xe-dap': // Bicycle
      return (
        <svg {...svgProps}>
          <circle cx="20" cy="42" r="9" fill={`${color}15`} />
          <circle cx="44" cy="42" r="9" fill={`${color}15`} />
          <path d="M20 42l8-18h18l-2 18" />
          <path d="M20 42h24" />
          <path d="M44 42l-6-24M28 24l-4-10h6" />
          <path d="M38 18h8" />
          <circle cx="32" cy="30" r="3" />
        </svg>
      );
    case 'trang-nhac-aerobic': // Megaphone/speaker
      return (
        <svg {...svgProps}>
          <path d="M12 26h10l14-12v36L22 38H12a2 2 0 01-2-2V28a2 2 0 012-2z" fill={`${color}15`} />
          <path d="M42 24a6 6 0 010 16M46 18a12 12 0 010 28" />
          <path d="M16 38v6M20 38v4" />
        </svg>
      );
    case 'trang-khu-tap-the': // Collective building facade
      return (
        <svg {...svgProps}>
          <rect x="14" y="8" width="36" height="48" rx="2" fill={`${color}10`} />
          <rect x="18" y="14" width="8" height="8" rx="1" />
          <rect x="38" y="14" width="8" height="8" rx="1" />
          <rect x="18" y="28" width="8" height="8" rx="1" />
          <rect x="38" y="28" width="8" height="8" rx="1" />
          <rect x="18" y="42" width="8" height="8" rx="1" />
          <rect x="38" y="42" width="8" height="8" rx="1" />
          <path d="M14 24h36M14 38h36" opacity="0.5" />
        </svg>
      );
    case 'essy-ngo-kho': // Narrow alleyways
      return (
        <svg {...svgProps}>
          <path d="M14 54L30 22h4l16 32" strokeWidth="2.5" />
          <path d="M22 54L31 36h2l9 18" />
          <path d="M14 54h32" />
          <path d="M10 8v46M54 8v46" strokeWidth="1" opacity="0.5" />
          <rect x="10" y="20" width="8" height="8" rx="1" fill={`${color}15`} />
          <rect x="46" y="20" width="8" height="8" rx="1" fill={`${color}15`} />
        </svg>
      );
    case 'essy-cay-xanh-ngo': // Green leaves
      return (
        <svg {...svgProps}>
          <path d="M32 54V22" strokeWidth="2.5" />
          <path d="M32 44c6-4 12-4 16-12-6 0-12 4-16 12z" fill={`${color}15`} />
          <path d="M32 36c-6-4-12-4-16-12 6 0 12 4 16 12z" fill={`${color}15`} />
          <path d="M32 26c4-3 8-3 11-8-4 0-8 3-11 8z" fill={`${color}15`} />
          <path d="M32 26c-4-3-8-3-11-8 4 0 8 3 11 8z" fill={`${color}15`} />
          <circle cx="32" cy="14" r="3" fill={color} />
        </svg>
      );
    case 'essy-ngap-mua': // Rain/flooding
      return (
        <svg {...svgProps}>
          <path d="M20 28c-4 0-7-3-7-7a7 7 0 0111-5.8 8 8 0 0115 1.8 7 7 0 017 7c0 4-3 7-7 7H20z" fill={`${color}15`} />
          <path d="M22 36l-3 8M32 36l-3 8M42 36l-3 8" strokeDasharray="3 3" />
          <ellipse cx="32" cy="52" rx="18" ry="4" fill={`${color}20`} />
          <ellipse cx="26" cy="49" rx="8" ry="1.5" opacity="0.6" />
        </svg>
      );
    case 'essy-tre-con-gieng': // Ancient well
      return (
        <svg {...svgProps}>
          <ellipse cx="32" cy="46" rx="20" ry="7" fill={`${color}15`} />
          <ellipse cx="32" cy="44" rx="16" ry="5.5" />
          <path d="M16 44v8c0 4 7.2 7.5 16 7.5s16-3.5 16-7.5v-8" />
          <path d="M20 44V14h24v30" strokeWidth="2.5" />
          <path d="M32 14v10" />
          <rect x="29" y="24" width="6" height="8" rx="1" fill={color} />
        </svg>
      );
    case 'essy-gieng-mat': // Ancient temple
      return (
        <svg {...svgProps}>
          <path d="M12 48h40" strokeWidth="2.5" />
          <path d="M18 48V32h28v16H18z" fill={`${color}15`} />
          <path d="M14 32c6-4 12-6 18-6s12 2 18 6" strokeWidth="2.5" />
          <path d="M32 12v14" />
          <path d="M24 20h16M28 16h8" />
          <rect x="27" y="36" width="10" height="12" rx="1" />
        </svg>
      );
    case 'essy-di-tich': // Coffee cup
      return (
        <svg {...svgProps}>
          <path d="M16 22h26v16c0 6.5-5.8 12-13 12s-13-5.5-13-12V22z" fill={`${color}15`} />
          <path d="M42 26h6a4 4 0 014 4v4a4 4 0 01-4 4h-6" />
          <path d="M12 50h34" strokeWidth="2.5" />
          <path d="M24 14c1-3-1-5-1-5s3 2 2 5M30 14c1-3-1-5-1-5s3 2 2 5" opacity="0.8" />
        </svg>
      );
    case 'thai-thinh-hoc-them': // School desk
      return (
        <svg {...svgProps}>
          <path d="M12 24h32v8H12z" fill={`${color}15`} />
          <path d="M16 32v18M40 32v18" strokeWidth="2.5" />
          <path d="M46 36h6v14" />
          <path d="M48 44h8v6" />
          <rect x="20" y="14" width="16" height="6" rx="1" />
        </svg>
      );
    case 'thai-thinh-pho-khong-xe': // Quiet street/ditch drainage
      return (
        <svg {...svgProps}>
          <path d="M10 42c10-2 20-2 44 0" strokeWidth="2.5" />
          <path d="M10 52c10-2 20-2 44 0M10 32h44" strokeDasharray="3 3" />
          <path d="M22 32V24c3 0 4-3 4-3s-1 3-4 3z" fill={`${color}15`} strokeWidth="1.5" />
          <path d="M42 32V20c-3 0-4-3-4-3s1 3 4 3z" fill={`${color}15`} strokeWidth="1.5" />
        </svg>
      );
    case 'thai-thinh-san-choi': // Playground slides
      return (
        <svg {...svgProps}>
          <path d="M14 50l12-28h4l18 28" strokeWidth="2.5" />
          <path d="M26 22h8v12l-8 16" fill={`${color}15`} />
          <circle cx="30" cy="14" r="3.5" />
          <path d="M18 36h26" />
        </svg>
      );
    case 'thai-thinh-tieng-cuoi': // Smileys
      return (
        <svg {...svgProps}>
          <circle cx="20" cy="30" r="8" fill={`${color}10`} />
          <circle cx="44" cy="24" r="8" fill={`${color}10`} />
          <path d="M16 28s2 2 4 0M40 22s2 2 4 0" />
          <path d="M30 46v-22l14-4v10" strokeWidth="2" />
          <circle cx="26" cy="46" r="3.5" fill={color} />
          <circle cx="40" cy="40" r="3.5" fill={color} />
        </svg>
      );
    case 'thai-thinh-vio-oc': // Violin snail
      return (
        <svg {...svgProps}>
          <path d="M14 42a10 10 0 0118-4c1 4-3 10-9 10s-9-3-9-6z" fill={`${color}15`} />
          <path d="M21 44c1-1 3-1 3 1s-2 3-3 1z" />
          <path d="M44 16c-2 0-4 2-4 4 0 2 2 4 1 6s-3 1-3 3 2 4 4 4 4-2 4-4 1-4 1-6-1-7-3-7z" fill={`${color}10`} />
          <path d="M44 10v6M36 28l16-16" strokeWidth="2" />
        </svg>
      );
    case 'thai-thinh-di-voi-me': // Bowl of snails
      return (
        <svg {...svgProps}>
          <path d="M14 26h36v8c0 10-8 18-18 18S14 36 14 34v-8z" fill={`${color}15`} />
          <path d="M10 26h44" strokeWidth="2.5" />
          <path d="M26 20l4-12M32 20l-2-12M38 20l6-12" />
          <circle cx="24" cy="30" r="2.5" fill={color} />
          <circle cx="32" cy="30" r="3" fill={color} />
          <circle cx="40" cy="30" r="2.5" fill={color} />
        </svg>
      );
    default:
      return (
        <svg {...svgProps}>
          <circle cx="32" cy="32" r="14" fill={`${color}15`} />
          <path d="M32 16v32M16 32h32" />
        </svg>
      );
  }
}
