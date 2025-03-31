import React from "react";
import {X, Star} from "lucide-react";
import type {Category} from "../../../core/domain/entities/Category";

interface PriceRange {
	id: string;
	label: string;
}

interface MobileFilterPanelProps {
	isOpen: boolean;
	onClose: () => void;
	categories: Category[];
	selectedCategories: string[];
	priceRanges: PriceRange[];
	selectedRangeId: string | null;
	selectedRating: number | null;
	showingDiscounted: boolean;
	onCategoryChange: (category: string, isSelected: boolean) => void;
	onPriceRangeChange: (min: number, max: number) => void;
	onRatingChange: (rating: number | null) => void;
	onDiscountToggle: () => void;
	onClearFilters: () => void;
	productCountByCategory: Record<string, number>;
}

const MobileFilterPanel: React.FC<MobileFilterPanelProps> = ({
	isOpen,
	onClose,
	categories,
	selectedCategories,
	priceRanges,
	selectedRangeId,
	selectedRating,
	showingDiscounted,
	onCategoryChange,
	onPriceRangeChange,
	onRatingChange,
	onDiscountToggle,
	onClearFilters,
	productCountByCategory,
}) => {
	// No renderizar si no está abierto
	if (!isOpen) return null;

	// Procesar rango de precio
	const handlePriceRangeSelect = (rangeId: string) => {
		const [min, max] = rangeId.split("-").map(Number);
		onPriceRangeChange(min, max);
	};

	// Calcular si hay filtros activos
	const hasActiveFilters =
		selectedCategories.length > 0 ||
		selectedRangeId !== null ||
		selectedRating !== null ||
		showingDiscounted;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex md:hidden">
			<div className="absolute inset-y-0 right-0 w-4/5 max-w-md bg-white overflow-y-auto flex flex-col">
				{/* Header */}
				<div className="flex justify-between items-center p-4 border-b border-gray-200">
					<h2 className="text-lg font-medium text-gray-800">Filtros</h2>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700"
					>
						<X size={24} />
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-4 space-y-6">
					{/* Categorías */}
					<div>
						<h3 className="font-medium text-gray-800 mb-3">Categorías</h3>
						<div className="space-y-2 max-h-60 overflow-y-auto">
							{categories.map((category) => (
								<div key={category.id} className="flex items-center">
									<input
										type="checkbox"
										id={`mobile-category-${category.id}`}
										checked={selectedCategories.includes(category.name)}
										onChange={() =>
											onCategoryChange(
												category.name,
												!selectedCategories.includes(category.name)
											)
										}
										className="h-4 w-4 text-primary-600 focus:ring-primary-500 rounded border-gray-300"
									/>
									<label
										htmlFor={`mobile-category-${category.id}`}
										className="ml-2 block text-sm text-gray-700"
									>
										{category.name}
										<span className="ml-1 text-gray-400 text-xs">
											({productCountByCategory[category.name] || 0})
										</span>
									</label>
								</div>
							))}
						</div>
					</div>

					{/* Precio */}
					<div>
						<h3 className="font-medium text-gray-800 mb-3">Precio</h3>
						<div className="space-y-2">
							{priceRanges.map((range) => (
								<button
									key={range.id}
									onClick={() => handlePriceRangeSelect(range.id)}
									className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
										selectedRangeId === range.id
											? "bg-primary-50 text-primary-700 font-medium"
											: "text-gray-700 hover:bg-gray-50"
									}`}
								>
									{range.label}
								</button>
							))}
						</div>
					</div>

					{/* Valoración */}
					<div>
						<h3 className="font-medium text-gray-800 mb-3">Valoración</h3>
						<div className="space-y-2">
							{[5, 4, 3, 2, 1].map((rating) => (
								<button
									key={rating}
									onClick={() =>
										onRatingChange(selectedRating === rating ? null : rating)
									}
									className={`flex items-center w-full px-3 py-2 rounded-md text-sm ${
										selectedRating === rating
											? "bg-primary-50 text-primary-700 font-medium"
											: "text-gray-700 hover:bg-gray-50"
									}`}
								>
									<div className="flex">
										{[...Array(5)].map((_, i) => (
											<Star
												key={i}
												size={16}
												fill={i < rating ? "currentColor" : "none"}
												className={
													i < rating ? "text-yellow-400" : "text-gray-300"
												}
											/>
										))}
									</div>
									<span className="ml-2">{rating}+ estrellas</span>
								</button>
							))}
						</div>
					</div>

					{/* Descuento */}
					<div>
						<div className="flex items-center">
							<input
								type="checkbox"
								id="mobile-discount-filter"
								checked={showingDiscounted}
								onChange={onDiscountToggle}
								className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
							/>
							<label
								htmlFor="mobile-discount-filter"
								className="ml-2 block text-sm text-gray-700"
							>
								Productos con descuento
							</label>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="p-4 border-t border-gray-200 space-y-3">
					{hasActiveFilters && (
						<button
							onClick={onClearFilters}
							className="w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 text-sm"
						>
							Limpiar filtros
						</button>
					)}

					<button
						onClick={onClose}
						className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm"
					>
						Ver resultados
					</button>
				</div>
			</div>
		</div>
	);
};

export default MobileFilterPanel;
