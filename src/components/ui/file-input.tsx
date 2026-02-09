import * as React from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface FileInputProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  label?: string;
  onFileChange?: (file: File | null) => void;
}

function FileInput({ className, label, onFileChange, onChange, ...props }: FileInputProps) {
  const [fileName, setFileName] = React.useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFileName(file?.name || '');
    if (onChange) {
      onChange(e);
    }
    if (onFileChange) {
      onFileChange(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div className="flex gap-2 items-center">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
          {...props}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          className="gap-2 shrink-0"
        >
          <Upload className="size-4" />
          <span>Choose File</span>
        </Button>
        <div
          className={cn(
            'flex-1 min-h-9 flex items-center px-3 rounded-md border border-input bg-background text-sm',
            'text-muted-foreground placeholder:text-muted-foreground',
            'focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
            fileName ? 'text-foreground' : '',
            'transition-colors'
          )}
        >
          <span className="truncate">{fileName || 'No file chosen'}</span>
        </div>
      </div>
    </div>
  );
}

export { FileInput };
