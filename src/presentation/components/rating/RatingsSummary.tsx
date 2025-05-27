import React from "react";
import {Star} from "lucide-react";
import StarRating from "./StarRating";

interface RatingsSummaryProps {
	averageRating: number;
	totalRatings: number;
	distribution: {
		"1": number;
		"2": number;
		"3": number;
		"4": number;
		"5": number;
	};
	className?: string;
}

/**
 * Componente para mostrar un resumen de las valoraciones
 * Incluye valoración media, total y distribución por estrellas
 */
const RatingsSummary: React.FC<RatingsSummaryProps> = ({
	averageRating,
	totalRatings,
	distribution,
	className = "",
}) => {
	// Calcular porcentajes para cada nivel de estrellas
	const calculatePercentage = (count: number): number => {
		return totalRatings > 0 ? (count / totalRatings) * 100 : 0;
	};

	return (
		<div
			className={`bg-white rounded-lg shadow-sm p-4 ${className}`}
		>
			<div className="flex flex-col md:flex-row items-start md:items-center">
				{/* Valoración promedio */}
				<div className="flex flex-col items-center mb-4 md:mb-0 md:mr-8">
					<div className="text-3xl font-bold text-gray-900">
						{averageRating.toFixed(1)}
					</div>
					<StarRating value={averageRating} readOnly size="small" />
					<div className="text-sm text-gray-500 mt-1">
						({totalRatings} {totalRatings === 1 ? "valoración" : "valoraciones"}
						)
					</div>
				</div>

				{/* Distribución de estrellas */}
				<div className="flex-grow w-full md:w-auto">
					{[5, 4, 3, 2, 1].map((stars) => {
						const count = distribution[stars.toString() as keyof typeof distribution] || 0;
						const percentage = calculatePercentage(count);

						return (
							<div key={stars} className="flex items-center mb-1">
								<div className="flex items-center w-16 text-sm text-gray-600">
									<span>{stars}</span>
									<Star size={12} className="ml-1 text-yellow-400" />
								</div>

								<div className="flex-grow mx-2">
									<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
										<div
											className="h-full bg-yellow-400 rounded-full"
											style={{width: `${percentage}%`}}
										></div>
									</div>
								</div>

								<div className="w-12 text-right text-xs text-gray-500">
									{count} ({percentage.toFixed(0)}%)
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default RatingsSummary;
