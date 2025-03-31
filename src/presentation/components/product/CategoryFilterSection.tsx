import React, {useState, useCallback, useMemo, memo} from "react";
import {Check, ChevronLeft, ChevronRight} from "lucide-react";
import FilterSection from "./FilterSection";

interface CategoryFilterSectionProps {
	categories: string[];
	selectedCategories: string[];
	isExpanded: boolean;
	onToggle: () => void;
	onCategoryChange: (category: string, isSelected: boolean) => void;
	isMobile?: boolean;
	// Para ordenar categorías por cantidad de productos
	productCountByCategory?: Record<string, number>;
}

/**
 * Componente mejorado para filtro de categorías
 * Implementa memoización y optimizaciones para evitar re-renderizados innecesarios
 */
const CategoryFilterSection: React.FC<CategoryFilterSectionProps> = ({
	categories,
	selectedCategories,
	isExpanded,
	onToggle,
	onCategoryChange,
	isMobile = false,
	productCountByCategory = {},
}) => {
	const ITEMS_PER_PAGE = 14;
	const [currentPage, setCurrentPage] = useState(0);

	// Ordenar categorías por cantidad de productos (memoizado)
	const sortedCategories = useMemo(() => {
		if (Object.keys(productCountByCategory).length > 0) {
			return [...categories].sort((a, b) => {
				const countA = productCountByCategory[a] || 0;
				const countB = productCountByCategory[b] || 0;
				return countB - countA; // De mayor a menor
			});
		}
		return categories;
	}, [categories, productCountByCategory]);

	const totalPages = Math.ceil(sortedCategories.length / ITEMS_PER_PAGE);

	// Obtener categorías para la página actual (memoizado)
	const pagedCategories = useMemo(() => {
		if (!isMobile) return sortedCategories;

		const start = currentPage * ITEMS_PER_PAGE;
		const end = start + ITEMS_PER_PAGE;
		return sortedCategories.slice(start, end);
	}, [sortedCategories, currentPage, isMobile, ITEMS_PER_PAGE]);

	// Manejadores memoizados para evitar recreaciones innecesarias
	const handlePreviousPage = useCallback(() => {
		setCurrentPage((prev) => Math.max(0, prev - 1));
	}, []);

	const handleNextPage = useCallback(() => {
		setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
	}, [totalPages]);

	// Manejar clic en categoría con prevención de propagación
	const handleCategoryClick = useCallback(
		(e: React.MouseEvent, category: string) => {
			e.preventDefault();
			e.stopPropagation();

			const isCurrentlySelected = selectedCategories.includes(category);
			onCategoryChange(category, !isCurrentlySelected);
		},
		[onCategoryChange, selectedCategories]
	);

	if (!isExpanded) {
		return (
			<FilterSection
				title="Categorías"
				isExpanded={isExpanded}
				onToggle={onToggle}
			/>
		);
	}

	return (
		<FilterSection
			title="Categorías"
			isExpanded={isExpanded}
			onToggle={onToggle}
		>
			<div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2 category-filter-container">
				{pagedCategories.map((category) => {
					const isSelected = selectedCategories.includes(category);
					return (
						<div
							key={category}
							className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md w-full"
							onClick={(e) => handleCategoryClick(e, category)}
							data-testid={`category-item-${category}`}
						>
							<div
								className={`w-5 h-5 border rounded flex items-center justify-center ${
									isSelected
										? "bg-primary-600 border-primary-600"
										: "border-gray-300"
								}`}
							>
								{isSelected && <Check size={14} className="text-white" />}
							</div>
							<span className="ml-2 text-gray-700 w-full flex justify-between">
								{category}
								{productCountByCategory[category] > 0 && (
									<span className="text-xs text-gray-500 ml-1">
										({productCountByCategory[category]})
									</span>
								)}
							</span>
						</div>
					);
				})}
			</div>

			{isMobile && totalPages > 1 && (
				<div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
					<button
						onClick={handlePreviousPage}
						disabled={currentPage === 0}
						className={`p-1 rounded-full border ${
							currentPage > 0
								? "text-gray-700 border-gray-300 hover:bg-gray-100"
								: "text-gray-400 border-gray-200 cursor-not-allowed"
						}`}
						aria-label="Página anterior"
					>
						<ChevronLeft size={16} />
					</button>

					<span className="text-sm text-gray-500">
						Página {currentPage + 1} de {totalPages}
					</span>

					<button
						onClick={handleNextPage}
						disabled={currentPage >= totalPages - 1}
						className={`p-1 rounded-full border ${
							currentPage < totalPages - 1
								? "text-gray-700 border-gray-300 hover:bg-gray-100"
								: "text-gray-400 border-gray-200 cursor-not-allowed"
						}`}
						aria-label="Página siguiente"
					>
						<ChevronRight size={16} />
					</button>
				</div>
			)}
		</FilterSection>
	);
};

// Usar memo para evitar re-renderizados innecesarios
export default memo(CategoryFilterSection);
