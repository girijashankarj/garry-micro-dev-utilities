import * as React from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

function Tooltip({ content, children, side = 'bottom', className }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className={cn('relative inline-block', className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            'absolute z-50 px-3 py-1.5 text-sm text-popover-foreground bg-popover border rounded-md shadow-md whitespace-normal max-w-md',
            sideClasses[side],
            'pointer-events-none'
          )}
        >
          {content}
          <div
            className={cn(
              'absolute w-2 h-2 bg-popover border-r border-b rotate-45',
              side === 'top' && 'top-full left-1/2 -translate-x-1/2 -mt-1',
              side === 'bottom' && 'bottom-full left-1/2 -translate-x-1/2 -mb-1',
              side === 'left' && 'left-full top-1/2 -translate-y-1/2 -ml-1',
              side === 'right' && 'right-full top-1/2 -translate-y-1/2 -mr-1'
            )}
          />
        </div>
      )}
    </div>
  );
}

interface InfoTooltipProps {
  content: string;
  className?: string;
}

function InfoTooltip({ content, className }: InfoTooltipProps) {
  return (
    <Tooltip content={content} className={className}>
      <Info className="size-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
    </Tooltip>
  );
}

export { Tooltip, InfoTooltip };
