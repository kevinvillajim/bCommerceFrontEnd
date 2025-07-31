import React, {useState} from "react";
import {ChevronUp, ChevronDown, Star, X} from "lucide-react";

// Interfaces para los props
interface ProductFiltersProps {
	categories: string[];
	priceRange: {min: number; max: number};
	onCategoryChange: (categories: string[]) => void;
	onPriceRangeChange: (range: {min: number; max: number} | null) => void;
	onRatingChange: (rating: number | null) => void;
	onDiscountChange: (showDiscount: boolean) => void;
	onClearFilters: () => void;
	selectedCategories: string[];
	selectedPriceRange: {min: number; max: number} | null;
	selectedRating: number | null;
	selectedDiscount: boolean;
	productCountByCategory: Record<string, number>;
}

// Interfaz para las secciones de filtro
interface FilterSectionProps {
	title: string;
	isExpanded: boolean;
	onToggle: () => void;
	children: React.ReactNode;
}

// Sección de categorías
interface CategoryFilterSectionProps {
	categories: string[];
	selectedCategories: string[];
	onCategoryChange: (categories: string[]) => void;
	isExpanded: boolean;
	onToggle: () => void;
	productCountByCategory: Record<string, number>;
}

// Sección de precio
interface PriceFilterSectionProps {
	initialMin: number;
	initialMax: number;
	selectedRange: {min: number; max: number} | null;
	isExpanded: boolean;
	onToggle: () => void;
	onApply: (min: number, max: number) => void;
	onClear: () => void;
}

// Sección de valoración
interface RatingFilterSectionProps {
	selectedRating: number | null;
	onRatingChange: (rating: number | null) => void;
	isExpanded: boolean;
	onToggle: () => void;
}

// Sección de descuento
interface DiscountFilterSectionProps {
	selectedDiscount: boolean;
	onDiscountChange: (showDiscount: boolean) => void;
	isExpanded: boolean;
	onToggle: () => void;
}

// Componente de sección de filtro genérico
const FilterSection: React.FC<FilterSectionProps> = ({
	title,
	isExpanded,
	onToggle,
	children,
}) => {
	return (
		<div className="border-b border-gray-200 pb-4">
			<button
				className="cursor-pointer flex justify-between items-center w-full py-2 text-left font-medium text-gray-700 hover:text-gray-900"
				onClick={onToggle}
			>
				{title}
				{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
			</button>

			{isExpanded && <div className="mt-2 space-y-2">{children}</div>}
		</div>
	);
};

// Componente para filtro de categorías
const CategoryFilterSection: React.FC<CategoryFilterSectionProps> = ({
	categories,
	selectedCategories,
	onCategoryChange,
	isExpanded,
	onToggle,
	productCountByCategory,
}) => {
	// Función para manejar cambios de categoría
	const handleCategoryToggle = (category: string) => {
		// Normalizar categoría para evitar problemas de espacios/case sensitivity
		const normalizedCategory = category.trim();
		const normalizedSelectedCategories = selectedCategories.map(c => c.trim());
		
		if (normalizedSelectedCategories.includes(normalizedCategory)) {
			// Remover la categoría - usar la categoría original, no normalizada
			const newCategories = selectedCategories.filter((c) => c.trim() !== normalizedCategory);
			onCategoryChange(newCategories);
		} else {
			// Agregar la categoría
			onCategoryChange([...selectedCategories, normalizedCategory]);
		}
	};

	return (
		<FilterSection
			title="Categorías"
			isExpanded={isExpanded}
			onToggle={onToggle}
		>
			<div className="space-y-1 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
				{categories.map((category, index) => {
					// ✅ CLAVE ÚNICA: usar index + category para evitar duplicados
					const uniqueKey = `category-${category}-${index}`;
					const uniqueId = `category-input-${category}-${index}`;

					return (
						<div key={uniqueKey} className="flex items-center">
							<input
								type="checkbox"
								id={uniqueId}
								checked={selectedCategories.map(c => c.trim()).includes(category.trim())}
								onChange={() => handleCategoryToggle(category)}
								className="cursor-pointer h-4 w-4 text-primary-600 focus:ring-primary-500 rounded border-gray-300"
							/>
							<label
								htmlFor={uniqueId}
								className="cursor-pointer ml-2 block text-sm text-gray-700"
							>
								{category}
								<span className="ml-1 text-gray-400 text-xs">
									({productCountByCategory[category] || 0})
								</span>
							</label>
						</div>
					);
				})}
			</div>
		</FilterSection>
	);
};

// Componente para filtro de precio
const PriceFilterSection: React.FC<PriceFilterSectionProps> = ({
	initialMin,
	initialMax,
	selectedRange,
	isExpanded,
	onToggle,
	onApply,
	onClear,
}) => {
	const [minPrice, setMinPrice] = useState<number>(
		selectedRange?.min || initialMin
	);
	const [maxPrice, setMaxPrice] = useState<number>(
		selectedRange?.max || initialMax
	);
	
	// Estados para inputs de texto que permiten edición libre
	const [minPriceText, setMinPriceText] = useState<string>(
		(selectedRange?.min || initialMin).toString()
	);
	const [maxPriceText, setMaxPriceText] = useState<string>(
		(selectedRange?.max || initialMax).toString()
	);
	const [minError, setMinError] = useState<string>("");
	const [maxError, setMaxError] = useState<string>("");

	// Función para validar y convertir texto a número
	const validateAndSetPrice = (value: string, type: 'min' | 'max') => {
		if (value === "") {
			// Permitir campo vacío temporalmente
			if (type === 'min') {
				setMinError("");
				setMinPriceText(value);
			} else {
				setMaxError("");
				setMaxPriceText(value);
			}
			return;
		}
		
		const numValue = parseInt(value);
		
		if (isNaN(numValue) || numValue < 0) {
			const error = "Solo se permiten números válidos";
			if (type === 'min') {
				setMinError(error);
			} else {
				setMaxError(error);
			}
			return;
		}
		
		// Validación exitosa
		if (type === 'min') {
			setMinError("");
			setMinPrice(numValue);
			setMinPriceText(value);
		} else {
			setMaxError("");
			setMaxPrice(numValue);
			setMaxPriceText(value);
		}
	};

	const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		validateAndSetPrice(e.target.value, 'min');
	};

	const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		validateAndSetPrice(e.target.value, 'max');
	};
	
	// Manejar cuando se enfoca en el campo (focus)
	const handleMinFocus = () => {
		if (minPriceText === "0" || minPriceText === initialMin.toString()) {
			setMinPriceText("");
		}
	};
	
	const handleMaxFocus = () => {
		if (maxPriceText === "0" || maxPriceText === initialMax.toString()) {
			setMaxPriceText("");
		}
	};
	
	// Manejar cuando pierde el foco (blur)
	const handleMinBlur = () => {
		if (minPriceText === "") {
			setMinPriceText(initialMin.toString());
			setMinPrice(initialMin);
			setMinError("");
		}
	};
	
	const handleMaxBlur = () => {
		if (maxPriceText === "") {
			setMaxPriceText(initialMax.toString());
			setMaxPrice(initialMax);
			setMaxError("");
		}
	};

	const handleApply = () => {
	// Verificar si hay errores antes de aplicar
	if (minError || maxError) {
	 return;
	}
	 
			// Asegurarse de que min no es mayor que max
			const validMin = Math.min(minPrice, maxPrice);
			const validMax = Math.max(minPrice, maxPrice);
			onApply(validMin, validMax);
		};

	return (
		<FilterSection title="Precio" isExpanded={isExpanded} onToggle={onToggle}>
			<div className="space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<div>
						<label
							htmlFor="min-price"
							className="block text-sm text-gray-500 mb-1"
						>
							Mínimo
						</label>
						<input
							type="text"
							id="min-price"
							value={minPriceText}
							onChange={handleMinChange}
							onFocus={handleMinFocus}
							onBlur={handleMinBlur}
							placeholder="Precio mínimo"
							className={`w-full p-2 border rounded ${
								minError ? 'border-red-300 bg-red-50' : 'border-gray-300'
							}`}
						/>
						{minError && (
							<p className="text-xs text-red-500 mt-1">{minError}</p>
						)}
					</div>
					<div>
						<label
							htmlFor="max-price"
							className="block text-sm text-gray-500 mb-1"
						>
							Máximo
						</label>
						<input
							type="text"
							id="max-price"
							value={maxPriceText}
							onChange={handleMaxChange}
							onFocus={handleMaxFocus}
							onBlur={handleMaxBlur}
							placeholder="Precio máximo"
							className={`w-full p-2 border rounded ${
								maxError ? 'border-red-300 bg-red-50' : 'border-gray-300'
							}`}
						/>
						{maxError && (
							<p className="text-xs text-red-500 mt-1">{maxError}</p>
						)}
					</div>
				</div>

				<div className="flex space-x-2">
					<button
						onClick={handleApply}
						disabled={minError || maxError}
						className={`flex-1 py-2 px-4 rounded text-sm ${
							minError || maxError
								? 'bg-gray-300 text-gray-500 cursor-not-allowed'
								: 'bg-primary-600 text-white hover:bg-primary-700'
						}`}
					>
						Aplicar
					</button>

					{selectedRange && (
						<button
							onClick={onClear}
							className="bg-gray-200 text-gray-700 py-2 px-3 rounded hover:bg-gray-300 text-sm"
						>
							<X size={18} />
						</button>
					)}
				</div>
			</div>
		</FilterSection>
	);
};

// Componente para filtro de valoración
const RatingFilterSection: React.FC<RatingFilterSectionProps> = ({
	selectedRating,
	onRatingChange,
	isExpanded,
	onToggle,
}) => {
	// Array de posibles valoraciones
	const ratings = [5, 4, 3, 2, 1];

	return (
		<FilterSection
			title="Valoración"
			isExpanded={isExpanded}
			onToggle={onToggle}
		>
			<div className="space-y-2">
				{ratings.map((rating) => {
					// Convertir a números para comparación correcta
					const isSelected = selectedRating !== null && Number(selectedRating) === Number(rating);
					
					return (
						<button
							key={`rating-${rating}`}
							onClick={() => {
								// Si ya está seleccionado, deseleccionar, sino seleccionar
								const newRating = isSelected ? null : rating;
								onRatingChange(newRating);
							}}
							className={`cursor-pointer flex items-center w-full p-2 rounded-md transition ${
								isSelected
									? "bg-primary-50 text-primary-700 border border-primary-200"
									: "hover:bg-gray-100 text-gray-700 border border-transparent"
							}`}
						>
						<div className="flex">
							{[...Array(5)].map((_, i) => (
								<Star
									key={`star-${rating}-${i}`}
									size={16}
									fill={i < rating ? "currentColor" : "none"}
									className={i < rating ? "text-yellow-400" : "text-gray-300"}
								/>
							))}
						</div>
							<span className="ml-2 text-sm">{rating}+ estrellas</span>
						</button>
					);
				})}
			</div>
		</FilterSection>
	);
};

// Componente para filtro de descuento
const DiscountFilterSection: React.FC<DiscountFilterSectionProps> = ({
	selectedDiscount,
	onDiscountChange,
	isExpanded,
	onToggle,
}) => {
	return (
		<FilterSection title="Ofertas" isExpanded={isExpanded} onToggle={onToggle}>
			<div className="space-y-2">
				<div className="flex items-center">
					<input
						type="checkbox"
						id="discount-filter"
						checked={selectedDiscount}
						onChange={() => onDiscountChange(!selectedDiscount)}
						className="cursor-pointer h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
					/>
					<label
						htmlFor="discount-filter"
						className="cursor-pointer ml-2 block text-sm text-gray-700"
					>
						Productos con descuento
					</label>
				</div>
				<p className="text-xs text-gray-500">
					Mostrar solo productos con ofertas especiales y descuentos
				</p>
			</div>
		</FilterSection>
	);
};

// Componente principal de filtros
const ProductFilters: React.FC<ProductFiltersProps> = ({
	categories,
	priceRange,
	onCategoryChange,
	onPriceRangeChange,
	onRatingChange,
	onDiscountChange,
	onClearFilters,
	selectedCategories,
	selectedPriceRange,
	selectedRating,
	selectedDiscount,
	productCountByCategory,
}) => {
	// Estado para controlar qué secciones están expandidas
	const [expandedSections, setExpandedSections] = useState({
		categories: true,
		price: true,
		rating: false,
		discount: false,
	});

	// Función para alternar la expansión de una sección
	const toggleSection = (section: keyof typeof expandedSections) => {
		setExpandedSections((prev) => ({
			...prev,
			[section]: !prev[section],
		}));
	};

	// Determinar si hay filtros activos
	const hasActiveFilters =
		selectedCategories.length > 0 ||
		selectedPriceRange !== null ||
		selectedRating !== null ||
		selectedDiscount;

	return (
		<div className="bg-white rounded-lg shadow p-4">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-lg font-medium text-gray-800">Filtros</h2>

				{hasActiveFilters && (
					<button
						onClick={onClearFilters}
						className="text-sm text-primary-600 hover:text-primary-700"
					>
						Limpiar filtros
					</button>
				)}
			</div>

			<div className="space-y-4">
				{/* Sección de Categorías */}
				<CategoryFilterSection
					categories={categories}
					selectedCategories={selectedCategories}
					onCategoryChange={onCategoryChange}
					isExpanded={expandedSections.categories}
					onToggle={() => toggleSection("categories")}
					productCountByCategory={productCountByCategory}
				/>

				{/* Sección de Precio */}
				<PriceFilterSection
					initialMin={priceRange.min}
					initialMax={priceRange.max}
					selectedRange={selectedPriceRange}
					isExpanded={expandedSections.price}
					onToggle={() => toggleSection("price")}
					onApply={(min, max) => onPriceRangeChange({min, max})}
					onClear={() => onPriceRangeChange(null)}
				/>

				{/* Sección de Valoración */}
				<RatingFilterSection
					selectedRating={selectedRating}
					onRatingChange={onRatingChange}
					isExpanded={expandedSections.rating}
					onToggle={() => toggleSection("rating")}
				/>

				{/* Sección de Descuentos */}
				<DiscountFilterSection
					selectedDiscount={selectedDiscount}
					onDiscountChange={onDiscountChange}
					isExpanded={expandedSections.discount}
					onToggle={() => toggleSection("discount")}
				/>
			</div>
		</div>
	);
};

export default ProductFilters;
