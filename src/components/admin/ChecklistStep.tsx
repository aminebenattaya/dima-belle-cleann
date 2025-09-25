
// src/components/admin/ChecklistStep.tsx
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface ChecklistStepProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText: string;
  href: string;
  linkTarget?: string; // Pour les liens externes comme _blank
}

export function ChecklistStep({ icon: Icon, title, description, buttonText, href, linkTarget }: ChecklistStepProps) {
  return (
    <Card className="flex flex-col shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-start gap-4">
        <div className="p-3 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
            <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={href} target={linkTarget} rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}>
            {buttonText} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
