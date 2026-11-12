import React from 'react';
import { cn } from '@/lib/utils';

export interface PlateProps extends React.HTMLAttributes<HTMLSpanElement> {
  plate: string;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'standard' | 'dark-contrast';
}

/**
 * Plate - Double-ruled license plate container with Barlow Condensed 700 letter-spaced typography.
 * Follows the Workshop Ledger design token specifications:
 * - sm (18px line height) - For dense tables and lists
 * - md (26px line height) - For board cards
 * - lg (40px line height) - For headers, check-in, and mechanic views
 */
export const Plate: React.FC<PlateProps> = ({
  plate,
  size = 'md',
  theme = 'standard',
  className,
  ...props
}) => {
  const sizeStyles = {
    sm: {
      outer: 'p-[1.5px] rounded-[3px] text-xs',
      inner: 'px-1.5 py-0.5 rounded-[2px]',
      text: 'text-[13px] tracking-wider font-bold',
    },
    md: {
      outer: 'p-[2px] rounded-[4px] text-sm',
      inner: 'px-2.5 py-1 rounded-[3px]',
      text: 'text-[19px] sm:text-[21px] tracking-widest font-bold',
    },
    lg: {
      outer: 'p-[2.5px] rounded-[6px]',
      inner: 'px-4 py-1.5 rounded-[4px]',
      text: 'text-[28px] sm:text-[34px] tracking-widest font-bold',
    },
  }[size];

  // Clean formatting: stored uppercase with single spaces around dashes
  const formattedPlate = plate.toUpperCase().trim();

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center select-none font-plate leading-none whitespace-nowrap',
        'border border-slate-900 bg-white text-slate-950 shadow-sm',
        sizeStyles.outer,
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'inline-flex items-center justify-center border border-slate-900/80',
          sizeStyles.inner,
          sizeStyles.text
        )}
      >
        {formattedPlate}
      </span>
    </span>
  );
};
