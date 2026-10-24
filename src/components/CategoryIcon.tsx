import {
  Zap,
  Cable,
  Lightbulb,
  ShieldCheck,
  Fan,
  Wrench,
  Package,
} from 'lucide-react';

interface CategoryIconProps {
  name?: string;
  className?: string;
  size?: number;
}

export function CategoryIcon({ name, className = '', size = 24 }: CategoryIconProps) {
  switch (name) {
    case 'Zap':
      return <Zap size={size} className={className} aria-hidden="true" />;
    case 'Cable':
      return <Cable size={size} className={className} aria-hidden="true" />;
    case 'Lightbulb':
      return <Lightbulb size={size} className={className} aria-hidden="true" />;
    case 'ShieldCheck':
      return <ShieldCheck size={size} className={className} aria-hidden="true" />;
    case 'Fan':
      return <Fan size={size} className={className} aria-hidden="true" />;
    case 'Wrench':
      return <Wrench size={size} className={className} aria-hidden="true" />;
    default:
      return <Package size={size} className={className} aria-hidden="true" />;
  }
}
