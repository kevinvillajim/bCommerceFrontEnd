import React, {useState, useEffect} from "react";
import {
	AlertTriangle,
	Download,
	RefreshCw,
	Eye,
	Clock,
	Server,
	User,
} from "lucide-react";
import Table from "../../components/dashboard/Table";

// Definir el tipo para una entrada de registro
interface LogEntry {
	id: number;
	timestamp: string;
	level: "info" | "warning" | "error" | "critical";
	message: string;
	source: string;
	details?: string;
	userId?: number;
	ip?: string;
	userAgent?: string;
}

// Página de Visualización de Registros de Errores
const AdminLogViewerPage: React.FC = () => {
	// Estados
	const [logs, setLogs] = useState<LogEntry[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
	const [levelFilter, setLevelFilter] = useState<string>("all");
	const [sourceFilter, setSourceFilter] = useState<string>("all");
	const [dateFilter, setDateFilter] = useState<string>("");

	// Opciones para filtros
	const levels = ["all", "info", "warning", "error", "critical"];
	const sources = ["all", "backend", "frontend", "database", "auth", "payment"];

	// Columnas para la tabla
	const columns = [
		{
			key: "id",
			header: "ID",
			sortable: true,
		},
		{
			key: "timestamp",
			header: "Fecha y Hora",
			sortable: true,
			render: (log: LogEntry) => {
				const date = new Date(log.timestamp);
				return (
					<div className="flex items-center">
						<Clock className="w-4 h-4 mr-1 text-gray-400" />
						<span>{date.toLocaleString()}</span>
					</div>
				);
			},
		},
		{
			key: "level",
			header: "Nivel",
			sortable: true,
			render: (log: LogEntry) => {
				const colors = {
					info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
					warning:
						"bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
					error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
					critical:
						"bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
				};

				return (
					<span
						className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[log.level]}`}
					>
						{log.level.toUpperCase()}
					</span>
				);
			},
		},
		{
			key: "message",
			header: "Mensaje",
			sortable: true,
		},
		{
			key: "source",
			header: "Origen",
			sortable: true,
			render: (log: LogEntry) => (
				<div className="flex items-center">
					<Server className="w-4 h-4 mr-1 text-gray-400" />
					<span>{log.source}</span>
				</div>
			),
		},
		{
			key: "userId",
			header: "Usuario",
			sortable: true,
			render: (log: LogEntry) => (
				<div className="flex items-center">
					<User className="w-4 h-4 mr-1 text-gray-400" />
					<span>{log.userId || "N/A"}</span>
				</div>
			),
		},
		{
			key: "actions",
			header: "Acciones",
			render: (log: LogEntry) => (
				<div className="flex space-x-2">
					<button
						onClick={() => setSelectedLog(log)}
						className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
						title="Ver detalles"
					>
						<Eye size={18} />
					</button>
				</div>
			),
		},
	];

	// Datos simulados para logs
	const generateMockLogs = (): LogEntry[] => {
		const mockLogs: LogEntry[] = [];
		const levels: ("info" | "warning" | "error" | "critical")[] = [
			"info",
			"warning",
			"error",
			"critical",
		];
		const sources = ["backend", "frontend", "database", "auth", "payment"];
		const messages = [
			"Error al procesar el pago",
			"Usuario no encontrado",
			"Fallo de conexión a la base de datos",
			"Tiempo de espera excedido",
			"Error de autenticación",
			"Solicitud incorrecta",
			"Recurso no encontrado",
			"Error interno del servidor",
			"Error en la validación de datos",
			"Producto no disponible",
		];

		// Generar 100 logs aleatorios
		for (let i = 1; i <= 100; i++) {
			const randomDate = new Date();
			randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));

			mockLogs.push({
				id: i,
				timestamp: randomDate.toISOString(),
				level: levels[Math.floor(Math.random() * levels.length)],
				message: messages[Math.floor(Math.random() * messages.length)],
				source: sources[Math.floor(Math.random() * sources.length)],
				details: `Detalles completos del error #${i}. Incluye información adicional y stack trace.`,
				userId:
					Math.random() > 0.3
						? Math.floor(Math.random() * 1000) + 1
						: undefined,
				ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
				userAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${Math.floor(Math.random() * 10) + 90}.0.${Math.floor(Math.random() * 1000) + 4000}.${Math.floor(Math.random() * 100)}`,
			});
		}

		// Ordenar por ID en orden descendente (más recientes primero)
		return mockLogs.sort((a, b) => b.id - a.id);
	};

	// Cargar datos al montar el componente
	useEffect(() => {
		// Simulación de carga de datos
		setLoading(true);
		setTimeout(() => {
			setLogs(generateMockLogs());
			setLoading(false);
		}, 800);
	}, []);

	// Filtrar logs
	const filteredLogs = logs.filter((log) => {
		// Filtrar por nivel
		if (levelFilter !== "all" && log.level !== levelFilter) {
			return false;
		}

		// Filtrar por origen
		if (sourceFilter !== "all" && log.source !== sourceFilter) {
			return false;
		}

		// Filtrar por fecha
		if (dateFilter) {
			const filterDate = new Date(dateFilter).setHours(0, 0, 0, 0);
			const logDate = new Date(log.timestamp).setHours(0, 0, 0, 0);
			if (filterDate !== logDate) {
				return false;
			}
		}

		return true;
	});

	// Refrescar logs
	const refreshLogs = () => {
		setLoading(true);
		setTimeout(() => {
			setLogs(generateMockLogs());
			setLoading(false);
		}, 800);
	};

	// Limpiar filtros
	const clearFilters = () => {
		setLevelFilter("all");
		setSourceFilter("all");
		setDateFilter("");
	};

	// Exportar logs
	const exportLogs = () => {
		const dataStr = JSON.stringify(filteredLogs, null, 2);
		const dataUri =
			"data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

		const exportFileDefaultName = `logs_export_${new Date().toISOString().slice(0, 10)}.json`;

		const linkElement = document.createElement("a");
		linkElement.setAttribute("href", dataUri);
		linkElement.setAttribute("download", exportFileDefaultName);
		linkElement.click();
	};

	// Resumen de logs por nivel
	const logSummary = {
		info: logs.filter((log) => log.level === "info").length,
		warning: logs.filter((log) => log.level === "warning").length,
		error: logs.filter((log) => log.level === "error").length,
		critical: logs.filter((log) => log.level === "critical").length,
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					Registros de Errores
				</h1>
				<div className="flex space-x-2">
					<button
						onClick={refreshLogs}
						className="px-3 py-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-md hover:bg-primary-200 dark:hover:bg-primary-800"
						title="Refrescar datos"
					>
						<RefreshCw size={20} />
					</button>
					<button
						onClick={exportLogs}
						className="px-3 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-800"
						title="Exportar registros"
					>
						<Download size={20} />
					</button>
				</div>
			</div>

			{/* Tarjetas de resumen */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg shadow-sm">
					<div className="flex justify-between items-center mb-2">
						<h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
							Info
						</h3>
						<span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full">
							{logSummary.info}
						</span>
					</div>
					<p className="text-xs text-blue-600 dark:text-blue-400">
						Registros informativos
					</p>
				</div>
				<div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg shadow-sm">
					<div className="flex justify-between items-center mb-2">
						<h3 className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
							Advertencias
						</h3>
						<span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-full">
							{logSummary.warning}
						</span>
					</div>
					<p className="text-xs text-yellow-600 dark:text-yellow-400">
						Registros de advertencia
					</p>
				</div>
				<div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg shadow-sm">
					<div className="flex justify-between items-center mb-2">
						<h3 className="text-sm font-semibold text-red-700 dark:text-red-300">
							Errores
						</h3>
						<span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-full">
							{logSummary.error}
						</span>
					</div>
					<p className="text-xs text-red-600 dark:text-red-400">
						Registros de error
					</p>
				</div>
				<div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg shadow-sm">
					<div className="flex justify-between items-center mb-2">
						<h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300">
							Críticos
						</h3>
						<span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full">
							{logSummary.critical}
						</span>
					</div>
					<p className="text-xs text-purple-600 dark:text-purple-400">
						Registros críticos
					</p>
				</div>
			</div>

			{/* Filtros */}
			<div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm space-y-4">
				<div className="flex items-center mb-2">
					<AlertTriangle className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
					<h2 className="text-lg font-medium text-gray-900 dark:text-white">
						Filtros
					</h2>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* Filtro por nivel */}
					<div>
						<label
							htmlFor="levelFilter"
							className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
						>
							Nivel
						</label>
						<select
							id="levelFilter"
							value={levelFilter}
							onChange={(e) => setLevelFilter(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
						>
							{levels.map((level) => (
								<option key={level} value={level}>
									{level === "all"
										? "Todos los niveles"
										: level.charAt(0).toUpperCase() + level.slice(1)}
								</option>
							))}
						</select>
					</div>

					{/* Filtro por origen */}
					<div>
						<label
							htmlFor="sourceFilter"
							className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
						>
							Origen
						</label>
						<select
							id="sourceFilter"
							value={sourceFilter}
							onChange={(e) => setSourceFilter(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
						>
							{sources.map((source) => (
								<option key={source} value={source}>
									{source === "all"
										? "Todos los orígenes"
										: source.charAt(0).toUpperCase() + source.slice(1)}
								</option>
							))}
						</select>
					</div>

					{/* Filtro por fecha */}
					<div>
						<label
							htmlFor="dateFilter"
							className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
						>
							Fecha
						</label>
						<input
							type="date"
							id="dateFilter"
							value={dateFilter}
							onChange={(e) => setDateFilter(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
						/>
					</div>
				</div>

				<div className="flex justify-end">
					<button
						onClick={clearFilters}
						className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
					>
						Limpiar filtros
					</button>
				</div>
			</div>

			{/* Tabla de logs */}
			<Table
				data={filteredLogs}
				columns={columns}
				loading={loading}
				searchFields={["message", "source"]}
				emptyMessage="No se encontraron registros de errores"
				pagination={{
					currentPage,
					totalPages: Math.ceil(filteredLogs.length / 10),
					totalItems: filteredLogs.length,
					itemsPerPage: 10,
					onPageChange: setCurrentPage,
				}}
			/>

			{/* Modal de detalles */}
			{selectedLog && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] overflow-hidden">
						<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
							<h3 className="text-lg font-medium text-gray-900 dark:text-white">
								Detalles del Registro #{selectedLog.id}
							</h3>
							<button
								onClick={() => setSelectedLog(null)}
								className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
							>
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
						<div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
								<div>
									<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
										Nivel
									</p>
									<p className="font-semibold text-gray-900 dark:text-white">
										{selectedLog.level.toUpperCase()}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
										Fecha y Hora
									</p>
									<p className="font-semibold text-gray-900 dark:text-white">
										{new Date(selectedLog.timestamp).toLocaleString()}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
										Origen
									</p>
									<p className="font-semibold text-gray-900 dark:text-white">
										{selectedLog.source}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
										Usuario ID
									</p>
									<p className="font-semibold text-gray-900 dark:text-white">
										{selectedLog.userId || "N/A"}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
										Dirección IP
									</p>
									<p className="font-semibold text-gray-900 dark:text-white">
										{selectedLog.ip || "N/A"}
									</p>
								</div>
								<div className="md:col-span-2">
									<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
										Mensaje
									</p>
									<p className="font-semibold text-gray-900 dark:text-white">
										{selectedLog.message}
									</p>
								</div>
								<div className="md:col-span-2">
									<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
										User Agent
									</p>
									<p className="font-semibold text-gray-900 dark:text-white break-words">
										{selectedLog.userAgent || "N/A"}
									</p>
								</div>
								<div className="md:col-span-2">
									<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
										Detalles
									</p>
									<pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-900 rounded-md text-sm text-gray-900 dark:text-gray-300 overflow-x-auto">
										{selectedLog.details || "Sin detalles adicionales."}
									</pre>
								</div>
							</div>
						</div>
						<div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
							<button
								onClick={() => setSelectedLog(null)}
								className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
							>
								Cerrar
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminLogViewerPage;
