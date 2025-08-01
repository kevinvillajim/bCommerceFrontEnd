import React from "react";
import { Link } from "react-router-dom";
import {formatDate} from "../../../utils/formatters/formatDate";
import StarRating from "./StarRating";
import {CheckCircle, Flag, ExternalLink, Eye} from "lucide-react";

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
	// 🔥 NUEVOS: Props para navegación
	showDetailsLink?: boolean;
	detailsLinkText?: string;
	context?: "user" | "seller" | "admin"; // Para determinar la ruta correcta
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
	reportReason,
	onReply,
	onReport,
	showActions = false,
	className = "",
	// 🔥 NUEVOS: Props de navegación
	showDetailsLink = true,
	detailsLinkText = "Ver detalles",
	context = "user",
}) => {
	// 🔥 NUEVO: Función para determinar la ruta correcta según el contexto
	const getDetailsRoute = (): string => {
		switch (context) {
			case "admin":
				return `/admin/ratings/${id}`;
			case "seller":
				return `/seller/ratings/${id}`;
			case "user":
			default:
				return `/ratings/${id}`;
		}
	};

	return (
		<div
			className={`bg-white rounded-lg shadow-sm p-4 relative ${className}`}
		>
			{/* 🔥 NUEVO: Enlace a detalles en la esquina superior derecha */}
			{showDetailsLink && (
				<div className="absolute top-4 right-4">
					<Link
						to={getDetailsRoute()}
						className="flex items-center text-sm text-primary-600 hover:text-primary-800 transition-colors"
						title={detailsLinkText}
					>
						<Eye className="h-4 w-4 mr-1" />
						<span className="hidden sm:inline">{detailsLinkText}</span>
					</Link>
				</div>
			)}

			{/* Encabezado con usuario y estrellas */}
			<div className="flex justify-between items-start mb-3 pr-16">
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
						<div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
							<span className="text-gray-600 font-semibold">
								{userName.charAt(0).toUpperCase()}
							</span>
						</div>
					)}

					{/* Información de usuario */}
					<div>
						<div className="font-medium text-gray-900">
							{userName}
						</div>
						<div className="text-xs text-gray-500">
							{formatDate(date)}
							{isVerifiedPurchase && (
								<span className="flex items-center text-green-600 ml-2 mt-1">
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
				<h3 className="font-medium text-gray-900 mb-1">
					{title}
				</h3>
			)}

			{comment && (
				<p className="text-gray-700 mb-3 line-clamp-3">{comment}</p>
			)}

			{/* Respuesta del vendedor */}
			{sellerResponse && (
				<div className="bg-gray-50 p-3 rounded-md mt-2 mb-2">
					<div className="text-sm font-medium text-gray-700 mb-1">
						Respuesta del vendedor
					</div>
					<p className="text-gray-600 text-sm line-clamp-2">
						{sellerResponse.text}
					</p>
					<div className="text-xs text-gray-500 mt-1">
						{formatDate(sellerResponse.date)}
					</div>
				</div>
			)}

			{/* Razón de reporte */}
			{reportReason && (
				<div className="bg-red-50 text-red-800 p-3 rounded-md mt-2 mb-2 text-sm">
					<div className="font-medium mb-1">Reporte</div>
					<p>{reportReason}</p>
				</div>
			)}

			{/* Acciones (responder, reportar) */}
			{showActions && (
				<div className="flex justify-between items-center mt-3">
					<div className="flex space-x-2">
						{!sellerResponse && onReply && (
							<button
								onClick={() => onReply(id)}
								className="text-sm text-blue-600 hover:text-blue-800"
							>
								Responder
							</button>
						)}

						{!reportReason && onReport && (
							<button
								onClick={() => onReport(id)}
								className="text-sm text-orange-600 hover:text-orange-800 flex items-center"
							>
								<Flag size={14} className="mr-1" />
								Reportar
							</button>
						)}
					</div>

					{/* 🔥 MEJORADO: Enlace de detalles más prominente en acciones */}
					{showDetailsLink && (
						<Link
							to={getDetailsRoute()}
							className="flex items-center text-sm text-primary-600 hover:text-primary-800 font-medium"
						>
							Ver completo
							<ExternalLink className="h-4 w-4 ml-1" />
						</Link>
					)}
				</div>
			)}
		</div>
	);
};

export default RatingCard;