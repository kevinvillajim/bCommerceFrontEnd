import React, {useState} from "react";
import {Star} from "lucide-react";

interface StarRatingProps {
	value: number;
	onChange?: (value: number) => void;
	size?: "small" | "medium" | "large";
	readOnly?: boolean;
	required?: boolean;
	maxStars?: number;
	className?: string;
}

/**
 * Componente de valoración con estrellas
 * Permite seleccionar o mostrar una calificación con estrellas
 */
const StarRating: React.FC<StarRatingProps> = ({
	value,
	onChange,
	size = "medium",
	readOnly = false,
	required = false,
	maxStars = 5,
	className = "",
}) => {
	const [hoverValue, setHoverValue] = useState<number>(0);
	const [isHovering, setIsHovering] = useState<boolean>(false);

	// Determinar tamaño de estrellas según la prop size
	const starSizes = {
		small: 16,
		medium: 24,
		large: 32,
	};

	const starSize = starSizes[size];

	// Clases para los diferentes estados de las estrellas
	const getStarClass = (starPosition: number) => {
		// Determinar si la estrella debe estar rellena
		// Comparamos con starPosition <= hoverValue o value para asegurarnos de que
		// la estrella en la posición 5 (última) se puede seleccionar correctamente
		const shouldBeFilled = isHovering
			? starPosition <= hoverValue
			: starPosition <= value;

		if (shouldBeFilled) {
			return "fill-yellow-400 text-yellow-400";
		}
		return "fill-none text-gray-300";
	};

	// Evento al hacer clic en una estrella
	const handleClick = (newValue: number) => {
		if (readOnly || !onChange) return;

		// Si hacemos clic en la estrella ya seleccionada, la deseleccionamos (valor 0)
		// Si no, seleccionamos el nuevo valor
		onChange(newValue === value ? 0 : newValue);
	};

	// Eventos de ratón
	const handleMouseEnter = (position: number) => {
		if (readOnly) return;
		setIsHovering(true);
		setHoverValue(position);
	};

	const handleMouseLeave = () => {
		if (readOnly) return;
		setIsHovering(false);
		setHoverValue(0);
	};

	return (
		<div
			className={`flex items-center space-x-1 ${className}`}
			onMouseLeave={handleMouseLeave}
		>
			{/* Generamos un array de longitud maxStars y lo iteramos */}
			{Array.from({length: maxStars}).map((_, index) => {
				// La posición de la estrella va de 1 a maxStars, no de 0 a maxStars-1
				const starPosition = index + 1;

				return (
					<Star
						key={index}
						size={starSize}
						className={`transition-colors cursor-${readOnly ? "default" : "pointer"} ${getStarClass(starPosition)}`}
						onClick={() => handleClick(starPosition)}
						onMouseEnter={() => handleMouseEnter(starPosition)}
						aria-label={`${starPosition} de ${maxStars} estrellas`}
					/>
				);
			})}

			{required && value === 0 && (
				<span className="text-red-500 text-xs ml-2">* Requerido</span>
			)}
		</div>
	);
};

export default StarRating;
