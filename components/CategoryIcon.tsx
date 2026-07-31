import {
  Utensils,
  Car,
  ShoppingBag,
  Home,
  Receipt,
  Film,
  HeartPulse,
  GraduationCap,
  Repeat,
  Plane,
  TrendingUp,
  MoreHorizontal,
  Banknote,
  Laptop,
  Building,
  Gift,
  HelpCircle,
  LucideProps
} from "lucide-react";

interface CategoryIconProps extends Omit<LucideProps, "ref"> {
  name: string;
}

export function CategoryIcon({ name, ...props }: CategoryIconProps) {
  switch (name) {
    case 'Utensils':
      return <Utensils {...props} />;
    case 'Car':
      return <Car {...props} />;
    case 'ShoppingBag':
      return <ShoppingBag {...props} />;
    case 'Home':
      return <Home {...props} />;
    case 'Receipt':
      return <Receipt {...props} />;
    case 'Film':
      return <Film {...props} />;
    case 'HeartPulse':
      return <HeartPulse {...props} />;
    case 'GraduationCap':
      return <GraduationCap {...props} />;
    case 'Repeat':
      return <Repeat {...props} />;
    case 'Plane':
      return <Plane {...props} />;
    case 'TrendingUp':
      return <TrendingUp {...props} />;
    case 'MoreHorizontal':
      return <MoreHorizontal {...props} />;
    case 'Banknote':
      return <Banknote {...props} />;
    case 'Laptop':
      return <Laptop {...props} />;
    case 'Building':
      return <Building {...props} />;
    case 'Gift':
      return <Gift {...props} />;
    default:
      return <HelpCircle {...props} />;
  }
}
