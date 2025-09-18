import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description?: string | ReactNode;
  className?: string;
};

export default function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={`mb-8 text-center ${className}`}>
      <h1 className="text-4xl md:text-5xl font-bold text-primary mb-3">
        {title}
      </h1>
      {description && (
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}
