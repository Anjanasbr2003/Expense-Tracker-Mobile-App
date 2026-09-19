import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  HeartPulse,
  GraduationCap,
  Plane,
  Coffee,
  Home,
  Briefcase,
  Gift,
  Music,
  Smartphone,
  Dumbbell,
  Wifi,
  Fuel,
  Shield,
  MoreHorizontal,
  Tag,
  type LucideIcon,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  HeartPulse,
  GraduationCap,
  Plane,
  Coffee,
  Home,
  Briefcase,
  Gift,
  Music,
  Smartphone,
  Dumbbell,
  Wifi,
  Fuel,
  Shield,
  MoreHorizontal,
  Tag,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', size = 20 }) => {
  const IconComponent = ICON_MAP[name] || MoreHorizontal;
  return <IconComponent className={className} size={size} />;
};

export const AVAILABLE_CATEGORY_ICONS = [
  'Utensils',
  'Car',
  'ShoppingBag',
  'Receipt',
  'Film',
  'HeartPulse',
  'GraduationCap',
  'Plane',
  'Coffee',
  'Home',
  'Briefcase',
  'Gift',
  'Music',
  'Smartphone',
  'Dumbbell',
  'Wifi',
  'Fuel',
  'Shield',
  'MoreHorizontal',
];
