import {useState, useEffect} from "react";
import {Star, Save, AlertTriangle, Info, RefreshCw} from "lucide-react";
import ConfigurationService from "../../../core/services/ConfigurationService";
import type {
	RatingStats,
} from "../../../presentation/types/admin/ratingConfigTypes";

const RatingConfigPage = () => {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	// Configuraciones
	const [autoApproveAll, setAutoApproveAll] = useState(false);
	const [autoApproveThreshold, setAutoApproveThreshold] = useState(2);

	// Estadísticas
	const [stats, setStats] = useState<RatingStats>({
		totalCount: 0,
		approvedCount: 0,
		pendingCount: 0,
		rejectedCount: 0,
	});

	// Inicializar el servicio de configuración
	const configService = new ConfigurationService();

	// Cargar configuraciones al montar
	useEffect(() => {
		loadConfigurations();
		loadRatingStats();
	}, []);

	// Cargar configuraciones desde la API
	const loadConfigurations = async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await configService.getRatingConfigs();

			if (response?.status === "success" && response.data) {
				// Extraer configuraciones
				const configs = response.data;

				setAutoApproveAll(
					(configs["ratings.auto_approve_all"]?.value as boolean) || false
				);

				setAutoApproveThreshold(
					(configs["ratings.auto_approve_threshold"]?.value as number) || 2
				);
			} else {
				// Si no hay datos o hay un error en la respuesta
				setError(
					response?.message || "No se pudieron cargar las configuraciones"
				);
				console.warn("Respuesta de configuraciones inválida:", response);
			}
		} catch (err) {
			console.error("Error al cargar configuraciones:", err);
			setError(
				"No se pudieron cargar las configuraciones. Por favor, inténtalo de nuevo."
			);
		} finally {
			setLoading(false);
		}
	};

	// Cargar estadísticas de valoraciones
	const loadRatingStats = async () => {
		try {
			const response = await configService.getRatingStats();

			if (response?.status === "success" && response.data) {
				setStats(response.data);
			} else {
				console.warn("Error al cargar estadísticas:", response?.message);
			}
		} catch (err) {
			console.error("Error al cargar estadísticas de valoraciones:", err);
		}
	};

	// Guardar configuraciones
	const saveConfigurations = async () => {
		setSaving(true);
		setError(null);
		setSuccess(null);

		try {
			const response = await configService.updateRatingConfigs({
				auto_approve_all: autoApproveAll,
				auto_approve_threshold: autoApproveThreshold,
			});

			if (response?.status === "success") {
				setSuccess("Configuraciones guardadas correctamente");
				// Actualizar estadísticas después de cambiar configuraciones
				loadRatingStats();
			} else {
				setError(response?.message || "Error al guardar las configuraciones");
			}
		} catch (err) {
			console.error("Error al guardar configuraciones:", err);
			setError(
				"No se pudieron guardar las configuraciones. Por favor, inténtalo de nuevo."
			);
		} finally {
			setSaving(false);
		}
	};

	// Aprobar todas las valoraciones pendientes
	const approveAllPendingRatings = async () => {
		if (
			!confirm(
				"¿Estás seguro de que deseas aprobar todas las valoraciones pendientes? Esta acción no se puede deshacer."
			)
		) {
			return;
		}

		setLoading(true);
		setError(null);
		setSuccess(null);

		try {
			const response = await configService.approveAllPendingRatings();

			if (response?.status === "success") {
				setSuccess(
					`Se han aprobado ${response.data?.count || 0} valoraciones pendientes`
				);
				// Actualizar estadísticas
				loadRatingStats();
			} else {
				setError(
					response?.message || "Error al aprobar valoraciones pendientes"
				);
			}
		} catch (err) {
			console.error("Error al aprobar valoraciones pendientes:", err);
			setError(
				"No se pudieron aprobar las valoraciones pendientes. Por favor, inténtalo de nuevo."
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900">
					Configuración de Valoraciones
				</h1>
				<button
					onClick={loadConfigurations}
					className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
					disabled={loading}
				>
					<RefreshCw
						size={18}
						className={`mr-2 ${loading ? "animate-spin" : ""}`}
					/>
					Actualizar
				</button>
			</div>

			{/* Panel de información */}
			<div className="bg-primary-50 text-primary-800 p-4 rounded-lg flex items-start">
				<Info className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
				<div>
					<h3 className="font-medium">Acerca de las valoraciones</h3>
					<p className="mt-1">
						Configura cómo se gestionan las valoraciones de usuarios en la
						plataforma. Puedes establecer aprobaciones automáticas basadas en
						umbrales de calificación o realizar moderación manual.
					</p>
				</div>
			</div>

			{/* Mensajes de error/éxito */}
			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
					<span className="block sm:inline">{error}</span>
				</div>
			)}

			{success && (
				<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
					<span className="block sm:inline">{success}</span>
				</div>
			)}

			{/* Panel de estadísticas */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-white p-4 rounded-lg shadow-sm">
					<h3 className="text-sm font-medium text-gray-500">
						Total de valoraciones
					</h3>
					<p className="text-2xl font-bold text-gray-900">
						{stats.totalCount}
					</p>
				</div>
				<div className="bg-white p-4 rounded-lg shadow-sm">
					<h3 className="text-sm font-medium text-gray-500">
						Aprobadas
					</h3>
					<p className="text-2xl font-bold text-green-600">
						{stats.approvedCount}
					</p>
				</div>
				<div className="bg-white p-4 rounded-lg shadow-sm">
					<h3 className="text-sm font-medium text-gray-500">
						Pendientes
					</h3>
					<p className="text-2xl font-bold text-yellow-600">
						{stats.pendingCount}
					</p>
				</div>
				<div className="bg-white p-4 rounded-lg shadow-sm">
					<h3 className="text-sm font-medium text-gray-500">
						Rechazadas
					</h3>
					<p className="text-2xl font-bold text-red-600">
						{stats.rejectedCount}
					</p>
				</div>
			</div>

			{/* Configuraciones */}
			<div className="bg-white rounded-lg shadow-sm">
				<div className="p-6">
					<h2 className="text-lg font-medium text-gray-900 mb-4">
						Configuración de Aprobación Automática
					</h2>

					{/* Aprobación automática de todos los ratings */}
					<div className="mb-6">
						<label className="flex items-center space-x-3 mb-3">
							<input
								type="checkbox"
								checked={autoApproveAll}
								onChange={(e) => setAutoApproveAll(e.target.checked)}
								className="form-checkbox h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
								disabled={saving}
							/>
							<span className="text-gray-900 font-medium">
								Aprobar automáticamente todas las valoraciones
							</span>
						</label>
						<p className="text-sm text-gray-500 ml-8">
							Cuando está activado, todas las valoraciones se aprobarán
							automáticamente sin moderación. No recomendado para sitios con
							alto tráfico o riesgo de spam.
						</p>
					</div>

					{/* Umbral de aprobación automática */}
					<div className={autoApproveAll ? "opacity-50" : ""}>
						<label className="block text-gray-700 font-medium mb-2">
							Umbral de aprobación automática
						</label>

						<div className="flex items-center mb-3">
							<div className="flex-1">
								<input
									type="range"
									min="1"
									max="5"
									step="1"
									value={autoApproveThreshold}
									onChange={(e) =>
										setAutoApproveThreshold(Number(e.target.value))
									}
									className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
									disabled={autoApproveAll || saving}
								/>
							</div>

							<div className="w-16 ml-4 flex space-x-0.5">
								{[1, 2, 3, 4, 5].map((star) => (
									<Star
										key={star}
										size={16}
										className={`${
											star <= autoApproveThreshold
												? "text-yellow-400 fill-current"
												: "text-gray-400"
										}`}
									/>
								))}
							</div>
						</div>

						<div className="flex justify-between text-xs text-gray-500 px-1">
							<span>Se requiere moderación: 1-{autoApproveThreshold}</span>
							<span>Aprobación automática: &gt;{autoApproveThreshold}</span>
						</div>

						<p className="text-sm text-gray-500 mt-3">
							Las valoraciones con {autoApproveThreshold} estrellas o menos
							requerirán aprobación manual. Las valoraciones con más de{" "}
							{autoApproveThreshold} estrellas se aprobarán automáticamente.
						</p>

						{autoApproveThreshold < 2 && (
							<div className="mt-3 flex items-start bg-yellow-50 p-3 rounded-md">
								<AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
								<p className="text-sm text-yellow-700">
									Un umbral muy bajo puede permitir valoraciones negativas
									automáticamente. Considera usar un valor de 2 o superior para
									una mejor moderación.
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Acciones */}
				<div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg flex flex-col sm:flex-row gap-3 justify-end">
					{stats.pendingCount > 0 && (
						<button
							type="button"
							onClick={approveAllPendingRatings}
							className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
							disabled={loading || saving}
						>
							Aprobar las {stats.pendingCount} valoraciones pendientes
						</button>
					)}

					<button
						type="button"
						onClick={saveConfigurations}
						className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
						disabled={loading || saving}
					>
						<Save size={18} className="mr-2" />
						{saving ? "Guardando..." : "Guardar configuración"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default RatingConfigPage;
