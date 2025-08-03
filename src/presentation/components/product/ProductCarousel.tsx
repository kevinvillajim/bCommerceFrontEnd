import React, {useState, useRef, useEffect} from "react";
import {ChevronLeft, ChevronRight} from "lucide-react";
import ProductCardCompact from "./ProductCardCompact";

// Interfaces
interface ProductType {
	id: number;
	name: string;
	price: number;
	discount?: number;
	rating?: number;
	reviews?: number;
	image: string;
	category?: string;
	isNew?: boolean;
	stock?: number;
	slug?: string;
}

interface CarouselProps {
	personalizedProducts: ProductType[];
	trendingProducts: ProductType[];
	onAddToCart: (id: number) => void;
	onAddToWishlist: (id: number) => void;
	color: boolean;
	isAuthenticated?: boolean;
}

// Componente de carrusel
const ProductCarousel: React.FC<CarouselProps> = ({
	personalizedProducts,
	trendingProducts,
	onAddToCart,
	onAddToWishlist,
	color,
	isAuthenticated = false,
}) => {
	// Refs para los contenedores de carrusel
	const personalizedCarouselRef = useRef<HTMLDivElement>(null);
	const trendingCarouselRef = useRef<HTMLDivElement>(null);

	// Estados para controlar botones de navegación
	const [canScrollLeftPersonalized, setCanScrollLeftPersonalized] =
		useState(false);
	const [canScrollRightPersonalized, setCanScrollRightPersonalized] =
		useState(true);
	const [canScrollLeftTrending, setCanScrollLeftTrending] = useState(false);
	const [canScrollRightTrending, setCanScrollRightTrending] = useState(true);

	// Función para desplazar a la izquierda
	const scrollLeft = (ref: React.RefObject<HTMLDivElement | null>) => {
		if (ref && ref.current) {
			// Obtener el ancho del primer elemento hijo para determinar cuánto desplazar
			const firstChild = ref.current.querySelector(".product-card-wrapper");
			if (firstChild) {
				// En móvil (menos de 640px) desplazarse de uno en uno, en otros tamaños de dos en dos
				const multiplier = window.innerWidth < 640 ? 1 : 2;
				const scrollAmount = -1 * (firstChild.clientWidth + 12) * multiplier;
				ref.current.scrollBy({left: scrollAmount, behavior: "smooth"});
			} else {
				// Fallback si no se puede obtener el ancho
				ref.current.scrollBy({left: -400, behavior: "smooth"});
			}
		}
	};

	// Función para desplazar a la derecha
	const scrollRight = (ref: React.RefObject<HTMLDivElement | null>) => {
		if (ref && ref.current) {
			// Obtener el ancho del primer elemento hijo para determinar cuánto desplazar
			const firstChild = ref.current.querySelector(".product-card-wrapper");
			if (firstChild) {
				// En móvil (menos de 640px) desplazarse de uno en uno, en otros tamaños de dos en dos
				const multiplier = window.innerWidth < 640 ? 1 : 2;
				const scrollAmount = (firstChild.clientWidth + 12) * multiplier;
				ref.current.scrollBy({left: scrollAmount, behavior: "smooth"});
			} else {
				// Fallback si no se puede obtener el ancho
				ref.current.scrollBy({left: 400, behavior: "smooth"});
			}
		}
	};

	// Función para comprobar si se puede desplazar
	const checkScrollability = (
		element: HTMLDivElement,
		setCanScrollLeft: React.Dispatch<React.SetStateAction<boolean>>,
		setCanScrollRight: React.Dispatch<React.SetStateAction<boolean>>
	) => {
		if (element) {
			setCanScrollLeft(element.scrollLeft > 0);
			setCanScrollRight(
				element.scrollWidth > element.clientWidth &&
					element.scrollLeft < element.scrollWidth - element.clientWidth
			);
		}
	};

	// Efecto para configurar oyentes de desplazamiento
	useEffect(() => {
		const personalizedEl = personalizedCarouselRef.current;
		const trendingEl = trendingCarouselRef.current;

		const handlePersonalizedScroll = () => {
			if (personalizedEl) {
				checkScrollability(
					personalizedEl,
					setCanScrollLeftPersonalized,
					setCanScrollRightPersonalized
				);
			}
		};

		const handleTrendingScroll = () => {
			if (trendingEl) {
				checkScrollability(
					trendingEl,
					setCanScrollLeftTrending,
					setCanScrollRightTrending
				);
			}
		};

		// También verificar scrollability cuando cambia el tamaño de la ventana
		const handleResize = () => {
			if (personalizedEl) {
				handlePersonalizedScroll();
			}
			if (trendingEl) {
				handleTrendingScroll();
			}
		};

		// Configurar oyentes
		if (personalizedEl) {
			personalizedEl.addEventListener("scroll", handlePersonalizedScroll);
			// Comprobar el estado inicial
			handlePersonalizedScroll();
		}

		if (trendingEl) {
			trendingEl.addEventListener("scroll", handleTrendingScroll);
			// Comprobar el estado inicial
			handleTrendingScroll();
		}

		// Agregar evento de redimensionamiento
		window.addEventListener("resize", handleResize);

		// Limpiar oyentes
		return () => {
			if (personalizedEl) {
				personalizedEl.removeEventListener("scroll", handlePersonalizedScroll);
			}
			if (trendingEl) {
				trendingEl.removeEventListener("scroll", handleTrendingScroll);
			}
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return (
		<div className="space-y-8">
			{/* Sección de productos personalizados */}
			<div className="relative">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-bold text-gray-800">
						Recomendados para ti
					</h2>
					<div className="flex gap-2">
						<button
							onClick={() =>
								scrollLeft(
									personalizedCarouselRef as React.RefObject<HTMLDivElement>
								)
							}
							disabled={!canScrollLeftPersonalized}
							className={`p-1 rounded-full border ${
								canScrollLeftPersonalized
									? "text-gray-700 border-gray-300 hover:bg-gray-100"
									: "text-gray-400 border-gray-200 cursor-not-allowed"
							}`}
						>
							<ChevronLeft size={20} />
						</button>
						<button
							onClick={() =>
								scrollRight(
									personalizedCarouselRef as React.RefObject<HTMLDivElement>
								)
							}
							disabled={!canScrollRightPersonalized}
							className={`p-1 rounded-full border ${
								canScrollRightPersonalized
									? "text-gray-700 border-gray-300 hover:bg-gray-100"
									: "text-gray-400 border-gray-200 cursor-not-allowed"
							}`}
						>
							<ChevronRight size={20} />
						</button>
					</div>
				</div>
				<div
					ref={personalizedCarouselRef}
					className="flex overflow-x-auto gap-3 pb-4 hide-scrollbar"
				>
					{personalizedProducts.map((product) => (
						<div
							key={`personalized-${product.id}`}
							className="product-card-wrapper flex-none w-[calc(100%-24px)] sm:w-[calc(50%-12px)] md:w-[calc(33.333%-12px)] xl:w-[calc(20%-12px)]"
						>
							<ProductCardCompact
								{...product}
								color={color}
								onAddToCart={onAddToCart}
								onAddToWishlist={onAddToWishlist}
							/>
						</div>
					))}
				</div>
			</div>

			{/* Sección de productos en tendencia/con descuento */}
			<div className="relative">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-bold text-gray-800">
						Ofertas y tendencias
					</h2>
					<div className="flex gap-2">
						<button
							onClick={() =>
								scrollLeft(
									trendingCarouselRef as React.RefObject<HTMLDivElement>
								)
							}
							disabled={!canScrollLeftTrending}
							className={`p-1 rounded-full border ${
								canScrollLeftTrending
									? "text-gray-700 border-gray-300 hover:bg-gray-100"
									: "text-gray-400 border-gray-200 cursor-not-allowed"
							}`}
						>
							<ChevronLeft size={20} />
						</button>
						<button
							onClick={() =>
								scrollRight(
									trendingCarouselRef as React.RefObject<HTMLDivElement>
								)
							}
							disabled={!canScrollRightTrending}
							className={`p-1 rounded-full border ${
								canScrollRightTrending
									? "text-gray-700 border-gray-300 hover:bg-gray-100"
									: "text-gray-400 border-gray-200 cursor-not-allowed"
							}`}
						>
							<ChevronRight size={20} />
						</button>
					</div>
				</div>
				<div
					ref={trendingCarouselRef}
					className="flex overflow-x-auto gap-3 pb-4 hide-scrollbar"
				>
					{trendingProducts.map((product) => (
						<div
							key={`trending-${product.id}`}
							className="product-card-wrapper flex-none w-[calc(100%-24px)] sm:w-[calc(50%-12px)] md:w-[calc(33.333%-12px)] xl:w-[calc(20%-12px)]"
						>
							<ProductCardCompact
								{...product}
								color={color}
								onAddToCart={onAddToCart}
								onAddToWishlist={onAddToWishlist}
							/>
						</div>
					))}
				</div>
			</div>

			{/* Estilos CSS para ocultar la barra de desplazamiento */}
			<style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;  /* Chrome, Safari, Opera */
        }
      `}</style>
		</div>
	);
};

export default ProductCarousel;