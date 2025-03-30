import React from 'react';
import type { ElementType } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Definimos la interfaz Category que acepta cualquier ElementType para el icono
interface Category {
  id: number;
  title: string;
  icon: ElementType;
  link: string;
}

// Para el CardProps seguimos exigiendo específicamente LucideIcon
interface CategoryCardProps {
  category: string;
  icon: LucideIcon;
  link?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, icon: Icon, link }) => {   
  const CardContent = () => (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 group">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
        <Icon className="w-5 h-5 text-gray-700 group-hover:text-primary-700 transition-colors duration-200" />
      </div>
      <span className="text-sm font-medium">{category}</span>
      <ChevronRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-primary-700 transition-colors duration-200" />
    </div>
  );

  if (link) {
    return (
      <Link to={link} className="block no-underline text-gray-800">
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
};

// El componente CategoriesProduct debe hacer un cast del tipo icon a LucideIcon
interface CategoriesProps {
  categories: Category[];
}

const CategoriesProduct: React.FC<CategoriesProps> = ({ categories }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-3">
      {categories.map((category) => (
        <CategoryCard 
          key={category.id}
          category={category.title}
          icon={category.icon as unknown as LucideIcon}
          link={category.link}
        />
      ))}
    </div>
  );
};

export default CategoriesProduct;