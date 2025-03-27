import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface Category {
  id: number;
  title: string;
    icon: LucideIcon;
    link: string
}

interface CategoryCardProps {
    category: string;
    icon: LucideIcon;
    link: string
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, icon: Icon, link=undefined }) => {
    return (
      <a href={link}>
    <div className="cursor-pointer bg-white shadow-md hover:shadow-xl rounded-xl p-6 text-center transition-all duration-300 hover:scale-105 border border-gray-50">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors">
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <h3 className="font-medium text-gray-800 tracking-wide">{category}</h3>
            </div>
        </a>
  );
};

interface CategoriesProps {
  categories: Category[];
}

const Categories: React.FC<CategoriesProps> = ({ categories }) => {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <CategoryCard 
            key={category.id} 
            category={category.title} 
                icon={category.icon}
                link={category.link}
          />
        ))}
      </div>
    </div>
  );
};

export default Categories;
