import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { ProductService } from "../../../core/services/ProductService";
import { formatCurrency } from "../../../utils/formatters/formatCurrency";
import { getImageUrl } from "../../../utils/imageManager";
import type { Product, ProductImage } from "../../../core/domain/entities/Product";
import type { ExtendedProductFilterParams } from "../../types/ProductFilterParams";

// Instancia del servicio de productos
const productService = new ProductService();

// Interface para las sugerencias
interface SearchSuggestion {
	id: number;
	name: string;
	price: number;
	finalPrice?: number;
	image?: string;
	stock: number;
}

interface SearchAutocompleteProps {
	placeholder?: string;
	className?: string;
	onNavigate?: () => void; // Callback para cuando navega a resultados
}

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = memo(({
	placeholder = "Buscar productos...",
	className = "",
	onNavigate, // Recibir el callback
}) => {
	// Estados
	const [searchTerm, setSearchTerm] = useState("");
	const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
	const [showDropdown, setShowDropdown] = useState(false);
	const [loading, setLoading] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);

	// Referencias
	const inputRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const debounceRef = useRef<NodeJS.Timeout>(null);

	// Hooks
	const navigate = useNavigate();

	// Función helper para extraer URL de imagen
	const getProductImageUrl = useCallback((imageData: string | ProductImage | undefined): string | undefined => {
		if (!imageData) return undefined;
		
		// Si es string, retornarlo directamente
		if (typeof imageData === 'string') {
			return imageData;
		}
		
		// Si es objeto ProductImage, extraer la URL
		if (typeof imageData === 'object') {
			return imageData.url || imageData.original || imageData.medium || imageData.thumbnail;
		}
		
		return undefined;
	}, []);

	// Función para adaptar productos a sugerencias
	const adaptProductToSuggestion = useCallback((product: Product): SearchSuggestion => {
		// Obtener la primera imagen disponible
		let imageUrl: string | undefined = undefined;
		
		// Prioridad: main_image > image > primera imagen del array
		if (product.main_image) {
			imageUrl = getProductImageUrl(product.main_image);
		} else if (product.image) {
			imageUrl = getProductImageUrl(product.image);
		} else if (Array.isArray(product.images) && product.images.length > 0) {
			imageUrl = getProductImageUrl(product.images[0]);
		}

		return {
			id: product.id || 0,
			name: product.name,
			price: product.price,
			finalPrice: product.finalPrice || product.final_price,
			image: imageUrl,
			stock: product.stock,
		};
	}, [getProductImageUrl]);

	// Función para buscar productos
	const searchProducts = useCallback(async (term: string) => {
		if (term.length < 2) {
			setSuggestions([]);
			setShowDropdown(false);
			return;
		}

		setLoading(true);
		try {
			const filterParams: ExtendedProductFilterParams = {
				term: term.trim(),
				limit: 7, // Máximo 7 sugerencias
				offset: 0,
				published: true, // Solo productos publicados
				inStock: true, // Solo productos en stock
			};

			const response = await productService.getProducts(filterParams);
			
			if (response && response.data) {
				const adaptedSuggestions = response.data.map(adaptProductToSuggestion);
				setSuggestions(adaptedSuggestions);
				setShowDropdown(adaptedSuggestions.length > 0);
			} else {
				setSuggestions([]);
				setShowDropdown(false);
			}
		} catch (error) {
			console.error("Error al buscar productos:", error);
			setSuggestions([]);
			setShowDropdown(false);
		} finally {
			setLoading(false);
		}
	}, [adaptProductToSuggestion]);

	// Debounce para la búsqueda
	const debouncedSearch = useCallback((term: string) => {
		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}

		debounceRef.current = setTimeout(() => {
			searchProducts(term);
		}, 300);
	}, [searchProducts]);

	// Manejar cambios en el input
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchTerm(value);
		setSelectedIndex(-1);
		
		if (value.trim()) {
			debouncedSearch(value);
		} else {
			setSuggestions([]);
			setShowDropdown(false);
		}
	};

	// Manejar envío del formulario
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchTerm.trim()) {
			navigateToResults(searchTerm.trim());
		}
	};

	// Navegar a la página de resultados
	const navigateToResults = (term: string) => {
		navigate(`/products?search=${encodeURIComponent(term)}`);
		setShowDropdown(false);
		if (inputRef.current) {
			inputRef.current.blur();
		}
		// Llamar al callback si existe (para cerrar menú móvil)
		if (onNavigate) {
			onNavigate();
		}
	};

	// Manejar selección de sugerencia
	const handleSuggestionClick = (suggestion: SearchSuggestion) => {
		setSearchTerm(suggestion.name);
		navigateToResults(suggestion.name);
	};

	// Limpiar búsqueda
	const clearSearch = () => {
		setSearchTerm("");
		setSuggestions([]);
		setShowDropdown(false);
		setSelectedIndex(-1);
		if (inputRef.current) {
			inputRef.current.focus();
		}
	};

	// Manejar navegación por teclado
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!showDropdown || suggestions.length === 0) return;

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setSelectedIndex(prev => 
					prev < suggestions.length - 1 ? prev + 1 : prev
				);
				break;
			case "ArrowUp":
				e.preventDefault();
				setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
				break;
			case "Enter":
				e.preventDefault();
				if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
					handleSuggestionClick(suggestions[selectedIndex]);
				} else if (searchTerm.trim()) {
					navigateToResults(searchTerm.trim());
				}
				break;
			case "Escape":
				setShowDropdown(false);
				setSelectedIndex(-1);
				if (inputRef.current) {
					inputRef.current.blur();
				}
				break;
		}
	};

	// Cerrar dropdown al hacer clic fuera
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node) &&
				inputRef.current &&
				!inputRef.current.contains(event.target as Node)
			) {
				setShowDropdown(false);
				setSelectedIndex(-1);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Limpiar timeout al desmontar
	useEffect(() => {
		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, []);

	// Resaltar texto coincidente
	const highlightMatch = (text: string, term: string) => {
		if (!term) return text;
		
		const regex = new RegExp(`(${term})`, "gi");
		const parts = text.split(regex);
		
		return parts.map((part, index) => 
			regex.test(part) ? (
				<span key={index} className="font-semibold text-primary-600">
					{part}
				</span>
			) : (
				part
			)
		);
	};

	return (
		<div className={`relative ${className}`}>
			<form onSubmit={handleSubmit} className="relative">
				<input
					ref={inputRef}
					type="text"
					placeholder={placeholder}
					value={searchTerm}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					className="w-full py-2 px-4 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
				/>
				
				{/* Botones de acción */}
				<div className="absolute right-3 top-2 flex items-center space-x-1">
					{searchTerm && (
						<button
							type="button"
							onClick={clearSearch}
							className="text-gray-400 hover:text-gray-600 p-1"
						>
							<X size={16} />
						</button>
					)}
					<button
						type="submit"
						className="text-gray-400 hover:text-primary-600 p-1"
					>
						<Search size={16} />
					</button>
				</div>

				{/* Indicador de carga */}
				{loading && (
					<div className="absolute right-12 top-3">
						<div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent"></div>
					</div>
				)}
			</form>

			{/* Dropdown de sugerencias */}
			{showDropdown && suggestions.length > 0 && (
				<div
					ref={dropdownRef}
					className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
				>
					{suggestions.map((suggestion, index) => (
						<div
							key={suggestion.id}
							onClick={() => handleSuggestionClick(suggestion)}
							className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
								index === selectedIndex ? "bg-primary-50" : ""
							}`}
						>
							<div className="flex items-center space-x-3">
								{/* Imagen del producto */}
								<div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-md overflow-hidden">
									{suggestion.image ? (
										<img
											src={getImageUrl(suggestion.image)}
											alt={suggestion.name}
											className="w-full h-full object-cover"
											onError={(e) => {
												const target = e.target as HTMLImageElement;
												target.style.display = "none";
											}}
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center">
											<Search className="w-6 h-6 text-gray-400" />
										</div>
									)}
								</div>

								{/* Información del producto */}
								<div className="flex-1 min-w-0">
									<div className="text-sm font-medium text-gray-900 truncate">
										{highlightMatch(suggestion.name, searchTerm)}
									</div>
									<div className="flex items-center space-x-2 mt-1">
										<span className="text-sm font-semibold text-primary-600">
											{formatCurrency(suggestion.finalPrice || suggestion.price)}
										</span>
										{suggestion.finalPrice && suggestion.finalPrice < suggestion.price && (
											<span className="text-xs text-gray-500 line-through">
												{formatCurrency(suggestion.price)}
											</span>
										)}
									</div>
								</div>

								{/* Stock */}
								<div className="flex-shrink-0">
									<span className={`text-xs px-2 py-1 rounded-full ${
										suggestion.stock > 0 
											? "bg-green-100 text-green-800" 
											: "bg-red-100 text-red-800"
									}`}>
										{suggestion.stock > 0 ? "En stock" : "Agotado"}
									</span>
								</div>
							</div>
						</div>
					))}

					{/* Opción para ver todos los resultados */}
					{searchTerm.trim() && (
						<div
							onClick={() => navigateToResults(searchTerm.trim())}
							className="px-4 py-3 text-center cursor-pointer hover:bg-gray-50 border-t border-gray-200"
						>
							<span className="text-sm text-primary-600 font-medium">
								Ver todos los resultados para "{searchTerm}"
							</span>
						</div>
					)}
				</div>
			)}
		</div>
	);
});

export default SearchAutocomplete;