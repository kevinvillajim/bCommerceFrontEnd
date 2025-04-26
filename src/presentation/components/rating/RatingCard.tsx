import React from "react";
import {formatDate} from "../../../utils/formatters/formatDate";
import StarRating from "./StarRating";
import {CheckCircle, Flag} from "lucide-react";

interface RatingCardProps {
	id: number;
	rating: number;
	title?: string;
	comment?: string;
	date: string;
	userName: string;
	userAvatar?: string;
	isVerifiedPurchase?: boolean;
	sellerResponse?: {
		text: string;
		date: string;
	};
	status?: "pending" | "approved" | "rejected";
	reportReason?: string;
	onReply?: (ratingId: number) => void;
	onReport?: (ratingId: number) => void;
	showActions?: boolean;
	className?: string;
}

/**
 * Componente para mostrar una valoración individual
 */
const RatingCard: React.FC<RatingCardProps> = ({
	id,
	rating,
	title,
	comment,
	date,
	userName,
	userAvatar,
	isVerifiedPurchase = false,
	sellerResponse,
	status = "approved",
	reportReason,
	onReply,
	onReport,
	showActions = false,
	className = "",
}) => {
	return (
		<div
			className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 ${className}`}
		>
			{/* Encabezado con usuario y estrellas */}
			<div className="flex justify-between items-start mb-3">
				<div className="flex items-center">
					{/* Avatar */}
					{userAvatar ? (
						<img
							src={userAvatar}
							alt={userName}
							className="w-10 h-10 rounded-full mr-3"
							onError={(e) => {
								const target = e.target as HTMLImageElement;
								target.onerror = null;
								target.src = "https://via.placeholder.com/40?text=U";
							}}
						/>
					) : (
						<div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
							<span className="text-gray-600 dark:text-gray-300 font-semibold">
								{userName.charAt(0).toUpperCase()}
							</span>
						</div>
					)}

					{/* Información de usuario */}
					<div>
						<div className="font-medium text-gray-900 dark:text-white">
							{userName}
						</div>
						<div className="text-xs text-gray-500 dark:text-gray-400">
							{formatDate(date)}
							{isVerifiedPurchase && (
								<span className="flex items-center text-green-600 dark:text-green-400 ml-2 mt-1">
									<CheckCircle size={12} className="mr-1" />
									Compra verificada
								</span>
							)}
						</div>
					</div>
				</div>

				{/* Estrellas */}
				<StarRating value={rating} readOnly size="small" />
			</div>

			{/* Contenido de la valoración */}
			{title && (
				<h3 className="font-medium text-gray-900 dark:text-white mb-1">
					{title}
				</h3>
			)}

			{comment && (
				<p className="text-gray-700 dark:text-gray-300 mb-3">{comment}</p>
			)}

			{/* Respuesta del vendedor */}
			{sellerResponse && (
				<div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mt-2 mb-2">
					<div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Respuesta del vendedor
					</div>
					<p className="text-gray-600 dark:text-gray-400 text-sm">
						{sellerResponse.text}
					</p>
					<div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
						{formatDate(sellerResponse.date)}
					</div>
				</div>
			)}

			{/* Razón de reporte */}
			{reportReason && (
				<div className="bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200 p-3 rounded-md mt-2 mb-2 text-sm">
					<div className="font-medium mb-1">Reporte</div>
					<p>{reportReason}</p>
				</div>
			)}

			{/* Acciones (responder, reportar) */}
			{showActions && (
				<div className="flex justify-end mt-3 space-x-2">
					{!sellerResponse && onReply && (
						<button
							onClick={() => onReply(id)}
							className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
						>
							Responder
						</button>
					)}

					{!reportReason && onReport && (
						<button
							onClick={() => onReport(id)}
							className="text-sm text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 flex items-center"
						>
							<Flag size={14} className="mr-1" />
							Reportar
						</button>
					)}
				</div>
			)}
		</div>
	);
};

export default RatingCard;
