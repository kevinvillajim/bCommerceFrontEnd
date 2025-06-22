import React, {useState} from "react";
import {
	ChevronLeft,
	ChevronRight,
	ChevronRight as ChevronRightIcon,
	Smartphone,
	Tv,
	Laptop,
	Monitor,
	Headphones,
	Camera,
	Watch,
	Speaker,
	Package,
} from "lucide-react";
import type {Category} from "../../../core/domain/entities/Category";

// Diccionario de iconos
const CATEGORY_ICONS: {[key: string]: React.ElementType} = {
	smartphone: Smartphone,
	smartphones: Smartphone,
	teléfono: Smartphone,
	telefono: Smartphone,
	móvil: Smartphone,
	movil: Smartphone,
	tv: Tv,
	tvs: Tv,
	televisor: Tv,
	televisión: Tv,
	television: Tv,
	laptop: Laptop,
	laptops: Laptop,
	portátil: Laptop,
	portatil: Laptop,
	ordenador: Laptop,
	computadora: Laptop,
	monitor: Monitor,
	monitores: Monitor,
	pantalla: Monitor,
	auricular: Headphones,
	auriculares: Headphones,
	headphone: Headphones,
	audio: Headphones,
	cámara: Camera,
	camara: Camera,
	foto: Camera,
	reloj: Watch,
	relojes: Watch,
	watch: Watch,
	altavoz: Speaker,
	altavoces: Speaker,
	speaker: Speaker,
	electrónica: Package,
	electronica: Package,
	informática: Laptop,
	informatica: Laptop,
	tecnología: Package,
	tecnologia: Package,
	moda: Package,
	ropa: Package,
	accesorios: Package,
};

interface CategoriesCarouselProps {
	categories: Category[];
	isLoading?: boolean;
	onCategoryClick?: (category: Category) => void;
}

const CategoriesCarousel: React.FC<CategoriesCarouselProps> = ({
	categories,
	isLoading = false,
	onCategoryClick,
}) => {
	// Estado para controlar la página actual
	const [currentPage, setCurrentPage] = useState(0);

	// Configuración responsiva de elementos por página
	const getItemsPerPage = () => {
		if (typeof window === 'undefined') return 8;
		
		const width = window.innerWidth;
		if (width < 640) return 4; // sm: 2x2
		if (width < 768) return 6; // md: 2x3  
		if (width < 1024) return 8; // lg: 2x4
		return 12; // xl: 3x4
	};

	const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage);

	// Escuchar cambios de tamaño de pantalla
	React.useEffect(() => {
		const handleResize = () => {
			setItemsPerPage(getItemsPerPage());
			// Ajustar página actual si es necesario
			const newTotalPages = Math.ceil(categories.length / getItemsPerPage());
			if (currentPage >= newTotalPages && newTotalPages > 0) {
				setCurrentPage(newTotalPages - 1);
			}
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, [categories.length, currentPage]);

	// Calcular el número de páginas
	const totalPages = Math.ceil(categories.length / itemsPerPage);

	// Obtener las categorías para la página actual
	const getCurrentPageCategories = () => {
		const start = currentPage * itemsPerPage;
		const end = start + itemsPerPage;
		return categories.slice(start, end);
	};

	// Navegar a la página anterior
	const goToPreviousPage = () => {
		if (currentPage > 0) {
			setCurrentPage(currentPage - 1);
		}
	};

	// Navegar a la página siguiente
	const goToNextPage = () => {
		if (currentPage < totalPages - 1) {
			setCurrentPage(currentPage + 1);
		}
	};

	// Manejar clic en categoría
	const handleCategoryClick = (category: Category, event: React.MouseEvent) => {
		event.preventDefault();
		if (onCategoryClick) {
			onCategoryClick(category);
		}
	};

	// Función para determinar qué ícono mostrar basado en el nombre de la categoría
	const renderIcon = (category: Category) => {
		// Si hay un emoji en el campo icon, usarlo
		if (category.icon && category.icon.match(/\p{Emoji}/u)) {
			return <span className="text-xl">{category.icon}</span>;
		}

		// Buscar el nombre de la categoría en el diccionario de iconos
		const lowerName = category.name.toLowerCase();
		const categoryKey = Object.keys(CATEGORY_ICONS).find(
			(key) => lowerName.includes(key) || key.includes(lowerName)
		);

		// Si se encuentra una coincidencia, usar el ícono correspondiente
		if (categoryKey) {
			const IconComponent = CATEGORY_ICONS[categoryKey];
			return <IconComponent size={20} className="text-gray-600" />;
		}

		// Si no hay coincidencia, usar un ícono genérico
		return <Package size={20} className="text-gray-600" />;
	};

	// Renderizar spinner durante la carga
	if (isLoading) {
		return (
			<div className="flex justify-center py-8">
				<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
			</div>
		);
	}

	// Si no hay categorías, mostrar mensaje
	if (categories.length === 0) {
		return (
			<div className="p-6 bg-gray-50 text-gray-500 rounded-lg text-center">
				<Package size={32} className="mx-auto mb-2 text-gray-400" />
				<p>No hay categorías disponibles</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Controles de navegación - Solo mostrar si hay múltiples páginas */}
			{totalPages > 1 && (
				<div className="flex items-center justify-between">
					<div className="text-sm text-gray-500">
						{categories.length} categorías
					</div>
					<div className="flex gap-2">
						<button
							onClick={goToPreviousPage}
							disabled={currentPage === 0}
							className={`p-2 rounded-full border transition-colors ${
								currentPage > 0
									? "cursor-pointer text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400"
									: "text-gray-400 border-gray-200 cursor-not-allowed"
							}`}
							aria-label="Página anterior"
						>
							<ChevronLeft size={18} />
						</button>
						
						{/* Indicadores de página */}
						<div className="flex items-center space-x-1">
							{Array.from({length: totalPages}).map((_, index) => (
								<button
									key={index}
									onClick={() => setCurrentPage(index)}
									className={`w-2 h-2 rounded-full transition-colors ${
										index === currentPage
											? "bg-primary-600"
											: "bg-gray-300 hover:bg-gray-400"
									}`}
									aria-label={`Ir a página ${index + 1}`}
								/>
							))}
						</div>

						<button
							onClick={goToNextPage}
							disabled={currentPage === totalPages - 1}
							className={`p-2 rounded-full border transition-colors ${
								currentPage < totalPages - 1
									? "cursor-pointer text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400"
									: "text-gray-400 border-gray-200 cursor-not-allowed"
							}`}
							aria-label="Página siguiente"
						>
							<ChevronRight size={18} />
						</button>
					</div>
				</div>
			)}

			{/* Grid de categorías - Responsivo */}
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-3">
				{getCurrentPageCategories().map((category) => (
					<div
						key={category.id}
						className="group block no-underline text-gray-800 cursor-pointer"
						onClick={(e) => handleCategoryClick(category, e)}
					>
						<div className="flex flex-col items-center gap-3 p-4 rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all duration-200 hover:shadow-sm">
							<div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 group-hover:bg-white group-hover:shadow-sm transition-all duration-200">
								{renderIcon(category)}
							</div>
							<div className="text-center">
								<span className="text-sm font-medium text-gray-800 group-hover:text-primary-700 transition-colors duration-200 line-clamp-2">
									{category.name}
								</span>
								{category.product_count !== undefined && category.product_count > 0 && (
									<span className="text-xs text-gray-500 mt-1 block">
										{category.product_count} productos
									</span>
								)}
							</div>
							<ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors duration-200 opacity-0 group-hover:opacity-100" />
						</div>
					</div>
				))}
			</div>

			{/* Información adicional */}
			{totalPages > 1 && (
				<div className="text-center text-sm text-gray-500">
					Página {currentPage + 1} de {totalPages}
				</div>
			)}
		</div>
	);
};

export default CategoriesCarousel;