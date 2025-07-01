// src/components/ui/CategoryIcon.tsx
import React from "react";
import {
	Folder,
	FolderOpen,
	Package,
	Laptop,
	Smartphone,
	Shirt,
	Car,
	Home,
	Book,
	Gamepad2,
	Music,
	Camera,
	Watch,
	Headphones,
	Monitor,
	Tablet,
	Dumbbell,
	Baby,
	Coffee,
	ShoppingCart,
	Gift,
	Star,
	Heart,
	Tag,
	TrendingUp,
	Zap,
	Diamond,
	Crown,
	Leaf,
	Sun,
	Flame,
	Snowflake,
	Mountain,
	Waves,
} from "lucide-react";
import type {LucideIcon} from "lucide-react";

import type {Category} from "../../../core/domain/entities/Category";

// Mapeo de iconos por nombre de categoría o icono personalizado
const ICON_MAP: Record<string, LucideIcon> = {
	// Iconos por defecto
	default: Folder,
	folder: Folder,
	"folder-open": FolderOpen,
	package: Package,

	// Tecnología
	laptop: Laptop,
	computer: Monitor,
	smartphone: Smartphone,
	phone: Smartphone,
	tablet: Tablet,
	headphones: Headphones,
	camera: Camera,
	watch: Watch,
	gaming: Gamepad2,
	games: Gamepad2,
	monitor: Monitor,
	technology: Laptop,
	electronics: Zap,

	// Ropa y accesorios
	shirt: Shirt,
	clothing: Shirt,
	fashion: Crown,
	accessories: Diamond,
	jewelry: Diamond,

	// Hogar y jardín
	home: Home,
	house: Home,
	garden: Leaf,
	furniture: Home,

	// Vehículos
	car: Car,
	automotive: Car,
	vehicles: Car,

	// Libros y educación
	book: Book,
	books: Book,
	education: Book,
	learning: Book,

	// Entretenimiento
	music: Music,
	entertainment: Music,
	movies: Camera,

	// Deportes y fitness
	sports: Dumbbell,
	fitness: Dumbbell,
	gym: Dumbbell,

	// Bebés y niños
	baby: Baby,
	kids: Baby,
	children: Baby,

	// Comida y bebidas
	food: Coffee,
	drinks: Coffee,
	coffee: Coffee,

	// Compras generales
	shopping: ShoppingCart,
	general: ShoppingCart,

	// Regalos y especiales
	gifts: Gift,
	special: Gift,
	featured: Star,
	popular: TrendingUp,
	trending: TrendingUp,
	new: Zap,
	sale: Tag,
	discount: Tag,

	// Emociones y estados
	favorites: Heart,
	love: Heart,
	star: Star,

	// Elementos naturales
	nature: Leaf,
	outdoor: Mountain,
	beach: Waves,
	summer: Sun,
	winter: Snowflake,
	hot: Flame,
	cold: Snowflake,
};

// Función para obtener el icono basado en el nombre de la categoría o icono personalizado
const getCategoryIcon = (category: Category): LucideIcon => {
	// Prioridad 1: Icono personalizado
	if (category.icon) {
		const customIcon = ICON_MAP[category.icon.toLowerCase()];
		if (customIcon) return customIcon;
	}

	// Prioridad 2: Icono basado en el nombre de la categoría
	const categoryName = category.name.toLowerCase();

	// Buscar coincidencias exactas
	const exactMatch = ICON_MAP[categoryName];
	if (exactMatch) return exactMatch;

	// Buscar coincidencias parciales
	for (const [key, icon] of Object.entries(ICON_MAP)) {
		if (categoryName.includes(key) || key.includes(categoryName)) {
			return icon;
		}
	}

	// Icono por defecto
	return category.featured ? Star : Folder;
};

// Función para obtener el color del icono basado en el estado de la categoría
const getIconColor = (category: Category): string => {
	if (!category.is_active) {
		return "text-gray-400";
	}

	if (category.featured) {
		return "text-yellow-600";
	}

	return "text-blue-600";
};

// Función para obtener el color de fondo del contenedor
const getBackgroundColor = (category: Category): string => {
	if (!category.is_active) {
		return "bg-gray-100";
	}

	if (category.featured) {
		return "bg-yellow-100";
	}

	return "bg-blue-100";
};

interface CategoryIconProps {
	category: Category;
	size?: number;
	className?: string;
	showBackground?: boolean;
}

/**
 * Componente para mostrar el icono de una categoría
 */
export const CategoryIcon: React.FC<CategoryIconProps> = ({
	category,
	size = 24,
	className = "",
	showBackground = true,
}) => {
	const IconComponent = getCategoryIcon(category);
	const iconColor = getIconColor(category);
	const backgroundColor = getBackgroundColor(category);

	if (showBackground) {
		return (
			<div
				className={`flex-shrink-0 h-10 w-10 rounded-md flex items-center justify-center ${backgroundColor} ${className}`}
			>
				<IconComponent size={size} className={iconColor} />
			</div>
		);
	}

	return <IconComponent size={size} className={`${iconColor} ${className}`} />;
};

/**
 * Hook para obtener información del icono de una categoría
 */
export const useCategoryIcon = (category: Category) => {
	const IconComponent = getCategoryIcon(category);
	const iconColor = getIconColor(category);
	const backgroundColor = getBackgroundColor(category);

	return {
		IconComponent,
		iconColor,
		backgroundColor,
	};
};

/**
 * Función utilitaria para obtener solo el componente de icono
 */
export const getCategoryIconComponent = (category: Category): LucideIcon => {
	return getCategoryIcon(category);
};

export default CategoryIcon;
