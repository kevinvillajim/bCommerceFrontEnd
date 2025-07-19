// src/components/ui/ProductImage.tsx
import React, {useState, useRef, useEffect} from "react";
import {Package} from "lucide-react";
import {
	getProductMainImage,
	// getImageUrl,
} from "../../../utils/imageManager";

// Función para obtener URL por defecto (placeholder)
const getDefaultImageUrl = (): string => {
	return `data:image/svg+xml,${encodeURIComponent(`
<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="300" fill="#e5e7eb"/>
  <circle cx="150" cy="120" r="30" fill="#9ca3af"/>
  <path d="M90 180L120 150L150 200L180 130L210 200V230H90V180Z" fill="#9ca3af"/>
  <text x="150" y="260" font-family="Arial, sans-serif" font-size="14" fill="#6b7280" text-anchor="middle">
    Sin imagen
  </text>
</svg>
`)}`;
};

interface ProductImageProps {
	product: any;
	alt?: string;
	className?: string;
	width?: number;
	height?: number;
	lazy?: boolean;
	showFallback?: boolean;
	onLoad?: () => void;
	onError?: () => void;
	priority?: boolean; // Para imágenes above-the-fold
}

/**
 * Componente optimizado para mostrar imágenes de productos
 * Incluye lazy loading, manejo de errores y fallback automático
 */
export const ProductImage: React.FC<ProductImageProps> = ({
	product,
	alt,
	className = "",
	width,
	height,
	lazy = true,
	showFallback = true,
	onLoad,
	onError,
	priority = false,
}) => {
	const [isLoaded, setIsLoaded] = useState(false);
	const [hasError, setHasError] = useState(false);
	const [isInView, setIsInView] = useState(!lazy || priority);
	const imgRef = useRef<HTMLImageElement>(null);
	const observerRef = useRef<IntersectionObserver | null>(null);

	// URL de la imagen principal del producto
	const imageUrl = getProductMainImage(product);
	const fallbackUrl = getDefaultImageUrl();

	// Alt text inteligente
	const imageAlt =
		alt ||
		(product?.name ? `Imagen de ${product.name}` : "Imagen del producto") ||
		"Producto";

	// Configurar Intersection Observer para lazy loading
	useEffect(() => {
		if (!lazy || priority || isInView) return;

		observerRef.current = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setIsInView(true);
						observerRef.current?.disconnect();
					}
				});
			},
			{
				rootMargin: "50px", // Cargar imagen 50px antes de que entre en vista
				threshold: 0.1,
			}
		);

		if (imgRef.current) {
			observerRef.current.observe(imgRef.current);
		}

		return () => {
			observerRef.current?.disconnect();
		};
	}, [lazy, priority, isInView]);

	// Manejar carga exitosa de imagen
	const handleLoad = () => {
		setIsLoaded(true);
		setHasError(false);
		onLoad?.();
	};

	// Manejar error de carga de imagen
	const handleError = () => {
		if (!hasError) {
			setHasError(true);
			setIsLoaded(false);
			onError?.();
		}
	};

	// Determinar qué imagen mostrar
	const currentImageUrl = hasError ? fallbackUrl : imageUrl;

	// Clases CSS para el contenedor
	const containerClasses = `
    relative overflow-hidden bg-gray-100
    ${className}
    ${!isLoaded ? "animate-pulse" : ""}
  `.trim();

	// Clases CSS para la imagen
	const imageClasses = `
    transition-opacity duration-300 object-cover w-full h-full
    ${isLoaded ? "opacity-100" : "opacity-0"}
    ${hasError ? "filter grayscale" : ""}
  `.trim();

	// Si no debe cargar aún (lazy loading), mostrar placeholder
	if (!isInView) {
		return (
			<div
				ref={imgRef}
				className={containerClasses}
				style={{width, height}}
				aria-label={`Cargando ${imageAlt}`}
			>
				{showFallback && (
					<div className="flex items-center justify-center w-full h-full">
						<Package className="w-8 h-8 text-gray-400" />
					</div>
				)}
			</div>
		);
	}

	return (
		<div className={containerClasses} style={{width, height}}>
			{/* Placeholder mientras carga */}
			{!isLoaded && showFallback && (
				<div className="absolute inset-0 flex items-center justify-center bg-gray-100">
					<Package className="w-8 h-8 text-gray-400" />
				</div>
			)}

			{/* Imagen principal */}
			<img
				ref={imgRef}
				src={currentImageUrl}
				alt={imageAlt}
				className={imageClasses}
				onLoad={handleLoad}
				onError={handleError}
				loading={priority ? "eager" : "lazy"}
				decoding="async"
				style={{width, height}}
			/>

			{/* Indicador de error si es necesario */}
			{hasError && showFallback && (
				<div className="absolute bottom-1 right-1 bg-red-100 text-red-600 text-xs px-1 py-0.5 rounded">
					Error
				</div>
			)}
		</div>
	);
};

/**
 * Hook para precargar imágenes de productos
 */
export const useProductImagePreloader = (products: any[]) => {
	useEffect(() => {
		if (!products?.length) return;

		// Precargar las primeras 3 imágenes de productos
		const imagesToPreload = products.slice(0, 3);

		imagesToPreload.forEach((product) => {
			const imageUrl = getProductMainImage(product);
			if (imageUrl) {
				const img = new Image();
				img.src = imageUrl;
			}
		});
	}, [products]);
};

/**
 * Variante específica para tablas de administración
 */
export const AdminProductImage: React.FC<{
	product: any;
	size?: number;
	className?: string;
}> = ({product, size = 40, className = ""}) => {
	return (
		<ProductImage
			product={product}
			width={size}
			height={size}
			className={`rounded-md ${className}`}
			lazy={false} // En admin, no usar lazy loading para mejor UX
			priority={true}
		/>
	);
};

/**
 * Variante para galería de productos
 */
export const ProductGalleryImage: React.FC<{
	product: any;
	className?: string;
	aspectRatio?: string;
}> = ({product, className = "", aspectRatio = "aspect-square"}) => {
	return (
		<div className={`${aspectRatio} ${className}`}>
			<ProductImage
				product={product}
				className="w-full h-full rounded-lg"
				lazy={true}
				showFallback={true}
			/>
		</div>
	);
};

/**
 * Variante para hero/principal de producto
 */
export const ProductHeroImage: React.FC<{
	product: any;
	className?: string;
}> = ({product, className = ""}) => {
	return (
		<ProductImage
			product={product}
			className={`w-full h-auto ${className}`}
			lazy={false}
			priority={true}
			showFallback={true}
		/>
	);
};

export default ProductImage;