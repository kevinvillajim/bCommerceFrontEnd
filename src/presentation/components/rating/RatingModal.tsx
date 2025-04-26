import React, {useState} from "react";
import {X, AlertTriangle, Package, Store} from "lucide-react";
import StarRating from "./StarRating";

interface RatingModalProps {
	type: "product" | "seller";
	entityId: number;
	entityName: string;
	entityImage?: string;
	orderId: number;
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: {
		rating: number;
		title?: string;
		comment?: string;
		entityId: number;
		orderId: number;
	}) => Promise<void>;
	onReport?: (data: {
		type: "product" | "seller";
		entityId: number;
		orderId: number;
		problemType: string;
		description: string;
	}) => Promise<void>;
}

/**
 * Modal para valorar productos o vendedores
 */
const RatingModal: React.FC<RatingModalProps> = ({
	type,
	entityId,
	entityName,
	entityImage,
	orderId,
	isOpen,
	onClose,
	onSubmit,
	onReport,
}) => {
	// Estados del formulario de valoración
	const [rating, setRating] = useState<number>(0);
	const [title, setTitle] = useState<string>("");
	const [comment, setComment] = useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	// Estados para el modo reporte
	const [isReportMode, setIsReportMode] = useState<boolean>(false);
	const [problemType, setProblemType] = useState<string>("");
	const [problemDescription, setProblemDescription] = useState<string>("");

	// Estado para confirmación de valoración negativa
	const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

	// Si el modal no está abierto, no lo renderizamos
	if (!isOpen) return null;

	// Reset de los formularios
	const resetForm = () => {
		setRating(0);
		setTitle("");
		setComment("");
		setIsReportMode(false);
		setProblemType("");
		setProblemDescription("");
		setShowConfirmation(false);
	};

	// Manejar cierre del modal
	const handleClose = () => {
		resetForm();
		onClose();
	};

	// Manejar envío de valoración
	const handleSubmit = async () => {
		// Si la valoración es baja (1-2 estrellas) y no estamos en modo confirmación
		if (rating <= 2 && !showConfirmation) {
			setShowConfirmation(true);
			return;
		}

		try {
			setIsSubmitting(true);

			await onSubmit({
				rating,
				title: title.trim() || undefined,
				comment: comment.trim() || undefined,
				entityId,
				orderId,
			});

			resetForm();
			onClose();
		} catch (error) {
			console.error("Error al enviar valoración:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Manejar envío de reporte
	const handleReportSubmit = async () => {
		if (!onReport) return;

		try {
			setIsSubmitting(true);

			await onReport({
				type,
				entityId,
				orderId,
				problemType,
				description: problemDescription,
			});

			resetForm();
			onClose();
		} catch (error) {
			console.error("Error al enviar reporte:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Alternar entre modos de valoración y reporte
	const toggleReportMode = () => {
		setIsReportMode(!isReportMode);
		setShowConfirmation(false);
	};

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			{/* Overlay oscuro */}
			<div
				className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
				onClick={handleClose}
			></div>

			{/* Contenido del modal */}
			<div className="flex min-h-screen items-center justify-center p-4">
				<div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-auto">
					{/* Botón de cierre */}
					<button
						onClick={handleClose}
						className="absolute top-3 right-3 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
						disabled={isSubmitting}
					>
						<X size={24} />
					</button>

					{/* Título del modal */}
					<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
						<h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
							{isReportMode ? (
								<>
									<AlertTriangle className="mr-2 text-orange-500" size={20} />
									Reportar problema
								</>
							) : (
								<>
									{type === "product" ? (
										<Package className="mr-2 text-blue-500" size={20} />
									) : (
										<Store className="mr-2 text-green-500" size={20} />
									)}
									Valorar {type === "product" ? "producto" : "vendedor"}
								</>
							)}
						</h3>
					</div>

					<div className="px-6 py-4">
						{/* Información del producto/vendedor */}
						<div className="flex items-center mb-4">
							{entityImage ? (
								<img
									src={entityImage}
									alt={entityName}
									className="w-16 h-16 object-cover rounded-md mr-4"
									onError={(e) => {
										const target = e.target as HTMLImageElement;
										target.onerror = null;
										target.src = "https://via.placeholder.com/64?text=Imagen";
									}}
								/>
							) : (
								<div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mr-4">
									{type === "product" ? (
										<Package size={24} className="text-gray-400" />
									) : (
										<Store size={24} className="text-gray-400" />
									)}
								</div>
							)}
							<div>
								<h4 className="font-medium text-gray-900 dark:text-white">
									{entityName}
								</h4>
								<p className="text-sm text-gray-500 dark:text-gray-400">
									Pedido: #{orderId}
								</p>
							</div>
						</div>

						{/* Formulario de Valoración */}
						{!isReportMode && !showConfirmation && (
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										Tu valoración
									</label>
									<StarRating
										value={rating}
										onChange={setRating}
										size="large"
										required
									/>
								</div>

								<div>
									<label
										htmlFor="rating-title"
										className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
									>
										Título (opcional)
									</label>
									<input
										id="rating-title"
										type="text"
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
										placeholder="Resume tu experiencia"
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										maxLength={100}
									/>
								</div>

								<div>
									<label
										htmlFor="rating-comment"
										className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
									>
										Comentario (opcional)
									</label>
									<textarea
										id="rating-comment"
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
										placeholder="Comparte tu experiencia con este producto"
										value={comment}
										onChange={(e) => setComment(e.target.value)}
										maxLength={500}
										rows={4}
									/>
								</div>
							</div>
						)}

						{/* Formulario de Reporte de Problema */}
						{isReportMode && !showConfirmation && (
							<div className="space-y-4">
								<div>
									<label
										htmlFor="problem-type"
										className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
									>
										Tipo de problema
									</label>
									<select
										id="problem-type"
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 dark:text-white"
										value={problemType}
										onChange={(e) => setProblemType(e.target.value)}
										required
									>
										<option value="">Selecciona el tipo de problema</option>
										{type === "product" ? (
											<>
												<option value="not_received">
													Producto no recibido
												</option>
												<option value="damaged">
													Producto dañado/defectuoso
												</option>
												<option value="different">
													Producto diferente al descrito
												</option>
												<option value="incomplete">Producto incompleto</option>
											</>
										) : (
											<>
												<option value="communication">
													Problemas de comunicación
												</option>
												<option value="shipping">Problemas de envío</option>
												<option value="customer_service">
													Mala atención al cliente
												</option>
											</>
										)}
										<option value="other">Otro problema</option>
									</select>
								</div>

								<div>
									<label
										htmlFor="problem-description"
										className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
									>
										Descripción del problema
									</label>
									<textarea
										id="problem-description"
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
										placeholder="Describe el problema en detalle"
										value={problemDescription}
										onChange={(e) => setProblemDescription(e.target.value)}
										rows={4}
										required
									/>
								</div>
							</div>
						)}

						{/* Confirmación de valoración negativa */}
						{showConfirmation && (
							<div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-md">
								<div className="flex items-start">
									<AlertTriangle
										className="text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3"
										size={20}
									/>
									<div>
										<h4 className="font-medium text-yellow-800 dark:text-yellow-200">
											¿Estás seguro de enviar una valoración baja?
										</h4>
										<p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
											Has calificado este{" "}
											{type === "product" ? "producto" : "vendedor"} con{" "}
											{rating} {rating === 1 ? "estrella" : "estrellas"}.
											¿Quieres continuar o prefieres reportar un problema
											específico?
										</p>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Pie del modal con botones de acción */}
					<div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
						{/* Botón izquierdo (varía según el contexto) */}
						<div>
							{!showConfirmation && (
								<button
									type="button"
									onClick={toggleReportMode}
									className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 flex items-center"
									disabled={isSubmitting}
								>
									{isReportMode ? (
										<>Volver a valoración</>
									) : (
										<>
											<AlertTriangle size={14} className="mr-1" />
											Reportar problema
										</>
									)}
								</button>
							)}
						</div>

						{/* Botones principales */}
						<div className="space-x-3">
							{/* Botón de cancelar */}
							<button
								type="button"
								onClick={handleClose}
								className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
								disabled={isSubmitting}
							>
								Cancelar
							</button>

							{/* Botón de acción principal */}
							{showConfirmation ? (
								<>
									<button
										type="button"
										onClick={() => setShowConfirmation(false)}
										className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
										disabled={isSubmitting}
									>
										Modificar valoración
									</button>
									<button
										type="button"
										onClick={handleSubmit}
										className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
										disabled={isSubmitting}
									>
										{isSubmitting ? "Enviando..." : "Enviar valoración"}
									</button>
								</>
							) : (
								<button
									type="button"
									onClick={isReportMode ? handleReportSubmit : handleSubmit}
									className={`px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 ${
										isReportMode
											? "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
											: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
									}`}
									disabled={
										isSubmitting ||
										(isReportMode &&
											(!problemType || !problemDescription.trim())) ||
										(!isReportMode && rating === 0)
									}
								>
									{isSubmitting
										? "Enviando..."
										: isReportMode
											? "Enviar reporte"
											: "Enviar valoración"}
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RatingModal;
