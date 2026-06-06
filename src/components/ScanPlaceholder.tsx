import { Box, Scan } from 'lucide-react';

interface ScanPlaceholderProps {
  label: string;
  className?: string;
}

// Placeholder for future Gaussian Splat / photogrammetry 3D scan.
// Replace this component's inner content with <Canvas> / splat viewer when assets are ready.
export function ScanPlaceholder({ label, className = '' }: ScanPlaceholderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-muctim/20 bg-white/20 backdrop-blur-sm p-4 ${className}`}
    >
      <div className="flex items-center gap-2 text-muctim-faded">
        <Box className="w-4 h-4" />
        <Scan className="w-4 h-4" />
      </div>
      <p className="font-mono text-[10px] text-muctim-faded uppercase tracking-widest text-center leading-relaxed">
        3D scan placeholder
        <br />
        <span className="normal-case font-sans text-[9px]">{label}</span>
      </p>
    </div>
  );
}
