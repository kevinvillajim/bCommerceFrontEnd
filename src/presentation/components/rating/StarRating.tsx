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
	const getStarClass = (index: number) => {
		const shouldBeFilled = isHovering ? index < hoverValue : index < value;

		if (shouldBeFilled) {
			return "fill-yellow-400 text-yellow-400";
		}
		return "fill-none text-gray-300 dark:text-gray-600";
	};

	// Evento al hacer clic en una estrella
	const handleClick = (newValue: number) => {
		if (readOnly || !onChange) return;
		onChange(newValue === value ? 0 : newValue);
	};

	// Eventos de ratón
	const handleMouseEnter = (index: number) => {
		if (readOnly) return;
		setIsHovering(true);
		setHoverValue(index);
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
			{Array.from({length: maxStars}).map((_, index) => (
				<Star
					key={index}
					size={starSize}
					className={`transition-colors cursor-${readOnly ? "default" : "pointer"} ${getStarClass(index + 1)}`}
					onClick={() => handleClick(index + 1)}
					onMouseEnter={() => handleMouseEnter(index + 1)}
					aria-label={`${index + 1} de ${maxStars} estrellas`}
				/>
			))}

			{required && value === 0 && (
				<span className="text-red-500 text-xs ml-2">* Requerido</span>
			)}
		</div>
	);
};

export default StarRating;
