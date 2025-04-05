import React from "react";
import {Star} from "lucide-react";

interface RatingStarsProps {
	rating?: number | null;
	maxRating?: number;
	size?: number;
	showValue?: boolean;
	reviews?: number;
}

/**
 * Componente para mostrar calificación con estrellas
 * Si no hay rating disponible, muestra un valor por defecto
 */
const RatingStars: React.FC<RatingStarsProps> = ({
	rating,
	maxRating = 5,
	size = 16,
	showValue = false,
	reviews,
}) => {
	// Si no hay rating, usar 4.5 como valor por defecto
	// Esto asegura que las estrellas siempre se muestren
	const normalizedRating =
		rating !== undefined && rating !== null
			? Math.max(0, Math.min(rating, maxRating))
			: 4.5; // Valor por defecto

	// Calcular la parte entera y decimal del rating
	const fullStars = Math.floor(normalizedRating);
	const hasHalfStar = normalizedRating - fullStars >= 0.5;

	return (
		<div className="flex items-center">
			<div className="flex">
				{Array.from({length: maxRating}).map((_, index) => (
					<Star
						key={index}
						size={size}
						className={
							index < fullStars
								? "text-yellow-400 fill-yellow-400" // Estrella completa
								: index === fullStars && hasHalfStar
									? "text-yellow-400 fill-yellow-400 w-1/2 overflow-hidden" // Media estrella
									: "text-gray-300" // Estrella vacía
						}
					/>
				))}
			</div>

			{/* Mostrar valor numérico si se solicita */}
			{showValue && (
				<span className="ml-1 text-xs text-gray-500">
					{normalizedRating.toFixed(1)}
					{reviews !== undefined && reviews > 0 && ` (${reviews})`}
				</span>
			)}
		</div>
	);
};

export default RatingStars;
