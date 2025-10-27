import React from 'react';
import { cn } from '@/components/ui/utils';

interface PageHeadlineProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  title: string;
  description?: string;
};

export function PageHeadline({
  className,
  title,
  description,
  ...props
}: PageHeadlineProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between mb-8', className
      )}
      {...props}
    >
      <div>
        <h1 className="text-4xl font-bold mb-2">{title}</h1>
        {description && (
          <p className="text-[#a1a1aa] text-lg">{description}</p>
        )}
      </div>
    </div>
  );
};
