import React from "react";
import {X, Filter} from "lucide-react";

interface ActiveFiltersProps {
	selectedCategories: string[];
	selectedPriceRange: {min: number; max: number} | null;
	selectedRating: number | null;
	searchTerm: string;
	showingDiscounted: boolean;
	onRemoveCategory: (category: string) => void;
	onClearPriceRange: () => void;
	onClearRating: () => void;
	onClearSearch: () => void;
	onToggleDiscount: () => void;
	onClearAllFilters: () => void;
	onToggleFilters: () => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
	selectedCategories,
	selectedPriceRange,
	selectedRating,
	searchTerm,
	showingDiscounted,
	onRemoveCategory,
	onClearPriceRange,
	onClearRating,
	onClearSearch,
	onToggleDiscount,
	onClearAllFilters,
	onToggleFilters,
}) => {
	// Verificar si hay filtros activos
	const hasActiveFilters =
		selectedCategories.length > 0 ||
		selectedPriceRange !== null ||
		selectedRating !== null ||
		showingDiscounted ||
		searchTerm !== "";

	// No mostrar si no hay filtros activos
	if (!hasActiveFilters) {
		return (
			<button
				onClick={onToggleFilters}
				className="md:hidden flex items-center px-4 py-2 bg-white rounded-lg shadow border border-gray-200 text-gray-700"
			>
				<Filter size={18} className="mr-2" />
				<span>Filtros</span>
			</button>
		);
	}

	return (
		<div className="w-full md:w-auto">
			<div className="flex items-center justify-between mb-2">
				<h3 className="text-sm font-medium text-gray-700 mr-3">Filtros Activos</h3>
				{hasActiveFilters && (
					<button
						onClick={onClearAllFilters}
						className="text-xs text-primary-600 hover:text-primary-700"
					>
						Limpiar todos
					</button>
				)}
			</div>

			<div className="flex flex-wrap gap-2">
				{/* Filtro móvil - Solo visible en móvil */}
				<button
					onClick={onToggleFilters}
					className="md:hidden flex items-center px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
				>
					<Filter size={14} className="mr-1" />
					<span>Filtrar</span>
				</button>

				{/* Término de búsqueda */}
				{searchTerm && (
					<div className="flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
						<span className="mr-1">Búsqueda: {searchTerm}</span>
						<button
							onClick={onClearSearch}
							className="ml-1 text-blue-500 hover:text-blue-700"
						>
							<X size={14} />
						</button>
					</div>
				)}

				{/* Categorías seleccionadas */}
				{selectedCategories.map((category, key) => (
					<div
						key={`Active Filter - ${category} - ${key}`}
						className="flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
					>
						<span className="mr-1">Categoría: {category}</span>
						<button
							onClick={() => onRemoveCategory(category)}
							className="ml-1 text-primary-500 hover:text-primary-700"
						>
							<X size={14} />
						</button>
					</div>
				))}

				{/* Rango de precio */}
				{selectedPriceRange && (
					<div className="flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
						<span className="mr-1">
							Precio: ${selectedPriceRange.min} - ${selectedPriceRange.max}
						</span>
						<button
							onClick={onClearPriceRange}
							className="ml-1 text-green-500 hover:text-green-700"
						>
							<X size={14} />
						</button>
					</div>
				)}

				{/* Valoración */}
				{selectedRating !== null && (
					<div className="flex items-center px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm">
						<span className="mr-1">
							Valoración: {selectedRating}+ estrellas
						</span>
						<button
							onClick={onClearRating}
							className="ml-1 text-yellow-500 hover:text-yellow-700"
						>
							<X size={14} />
						</button>
					</div>
				)}

				{/* Descuento */}
				{showingDiscounted && (
					<div className="flex items-center px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm">
						<span className="mr-1">Con descuento</span>
						<button
							onClick={onToggleDiscount}
							className="ml-1 text-red-500 hover:text-red-700"
						>
							<X size={14} />
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default ActiveFilters;
