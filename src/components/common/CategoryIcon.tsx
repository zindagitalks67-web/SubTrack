import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export function CategoryIcon({ name, className = '', size = 20 }: CategoryIconProps) {
  const Icon = (Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.Boxes;
  return <Icon className={className} width={size} height={size} />;
}
