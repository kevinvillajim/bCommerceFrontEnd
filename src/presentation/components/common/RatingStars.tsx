import React from "react";
import {Star} from "lucide-react";

interface RatingStarsProps {
	rating?: number | null;
	maxRating?: number;
	size?: number;
	showValue?: boolean;
	reviews?: number | null;
}

const RatingStars: React.FC<RatingStarsProps> = ({
	rating,
	maxRating = 5,
	size = 16,
	showValue = false,
	reviews,
}) => {
	const normalizedRating =
		rating !== undefined && rating !== null && rating > 0
			? Math.max(0, Math.min(rating, maxRating))
			: 0; // ✅ CORREGIDO: 0 en lugar de 4.5 cuando no hay rating

	return (
		<div className="flex items-center">
			<div className="flex relative gap-[2px]">
				{Array.from({length: maxRating}).map((_, index) => {
					const starFill =
						normalizedRating >= index + 1
							? 100
							: normalizedRating > index
								? (normalizedRating - index) * 100
								: 0;

					return (
						<div
							key={index}
							className="relative"
							style={{width: size, height: size}}
						>
							{/* Empty Star */}
							<Star
								size={size}
								className="text-gray-300 absolute top-0 left-0"
							/>
							{/* Filled Star with dynamic width */}
							<div
								className="overflow-hidden absolute top-0 left-0 text-yellow-400"
								style={{width: `${starFill}%`}}
							>
								<Star size={size} className="fill-yellow-400" />
							</div>
						</div>
					);
				})}
			</div>

			{showValue && normalizedRating > 0 && (
				<span className="ml-1 text-xs text-gray-500">
					{normalizedRating.toFixed(1)}
					{reviews !== undefined && reviews !== null && reviews > 0 && ` (${reviews})`}
				</span>
			)}
		</div>
	);
};

export default RatingStars;
