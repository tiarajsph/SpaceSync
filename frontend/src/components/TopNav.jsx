import { Radio } from "lucide-react";
import LiveClock from "./LiveClock";

export default function TopNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--color-blue)]/40 bg-[var(--color-navy)]/80 backdrop-blur">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
        {/* Center - Live Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LiveClock />
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <Radio className="h-3 w-3 text-status-available animate-pulse-glow" />
            <span className="text-[var(--color-light)]">Live Campus View</span>
          </div>
        </div>
      </div>
    </header>
  );
}
