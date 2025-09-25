import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageHeaderProps = {
  title: string;
  description?: string | ReactNode;
  className?: string;
};

export default function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-12 text-center', className)}>
      <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">
        {title}
      </h1>
      {description && (
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}
