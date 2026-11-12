import React from 'react';
import { useThemeStore } from '@/features/theme/store';
import { Sun, Moon, Sparkles, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ThemeSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { style, mode, setStyle, toggleMode } = useThemeStore();

  return (
    <div className={cn('inline-flex items-center gap-1.5 p-1 bg-muted rounded-lg border border-border text-xs', className)}>
      {/* Design Style Selector */}
      <div className="inline-flex rounded-md p-0.5 bg-background shadow-xs border border-border">
        <button
          type="button"
          onClick={() => setStyle('modern')}
          className={cn(
            'flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all min-h-[32px]',
            style === 'modern'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
          title="Workshop Ledger (Design guideline spec with steel-grey & signal orange)"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Workshop</span>
        </button>

        <button
          type="button"
          onClick={() => setStyle('classic')}
          className={cn(
            'flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all min-h-[32px]',
            style === 'classic'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
          title="Classic Office (Neutral slate & blue)"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Classic</span>
        </button>
      </div>

      {/* Light / Dark Mode Toggle */}
      <button
        type="button"
        onClick={toggleMode}
        className={cn(
          'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border border-border bg-background transition-colors min-h-[32px]',
          'hover:bg-muted text-foreground'
        )}
        title={mode === 'light' ? 'Switch to Workshop Dark' : 'Switch to Counter Light'}
      >
        {mode === 'light' ? (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Counter</span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Workshop</span>
          </>
        )}
      </button>
    </div>
  );
};
