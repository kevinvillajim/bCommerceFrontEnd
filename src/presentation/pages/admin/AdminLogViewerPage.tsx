import React, {useState, useEffect} from "react";
import {
  Download,
  RefreshCw,
  Eye,
  Clock,
  Server,
  User,
  Info,
  AlertCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import Table from "../../components/dashboard/Table";
import StatCardList from "../../components/dashboard/StatCardList";

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
					info: "bg-blue-100 text-blue-800",
					warning:
						"bg-yellow-100 text-yellow-800",
					error: "bg-red-100 text-red-800",
					critical:
						"bg-purple-100 text-purple-800",
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
						className="text-primary-600 hover:text-primary-900"
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

	const statItems = [
		{ 
		  title: "Info", 
		  value: logSummary.info, 
		  description: "Registros informativos", 
		  icon: Info, 
		  bgColor: "bg-blue-50/20", 
		  textColor: "text-blue-700", 
		  valueColor: "text-blue-800", 
		  descriptionColor: "text-blue-600", 
		  iconColor: "text-blue-600", 
		},
		{ 
		  title: "Advertencias", 
		  value: logSummary.warning, 
		  description: "Registros de advertencia", 
		  icon: AlertCircle, 
		  bgColor: "bg-yellow-50/20", 
		  textColor: "text-yellow-700", 
		  valueColor: "text-yellow-800", 
		  descriptionColor: "text-yellow-600", 
		  iconColor: "text-yellow-600", 
		},
		{ 
		  title: "Errores", 
		  value: logSummary.error, 
		  description: "Registros de error", 
		  icon: XCircle, 
		  bgColor: "bg-red-50/20", 
		  textColor: "text-red-700", 
		  valueColor: "text-red-800", 
		  descriptionColor: "text-red-600", 
		  iconColor: "text-red-600", 
		},
		{ 
		  title: "Críticos", 
		  value: logSummary.critical, 
		  description: "Registros críticos", 
		  icon: AlertTriangle, 
		  bgColor: "bg-purple-50/20", 
		  textColor: "text-purple-700", 
		  valueColor: "text-purple-800", 
		  descriptionColor: "text-purple-600", 
		  iconColor: "text-purple-600", 
		}
	  ];

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900">
					Registros de Errores
				</h1>
				<div className="flex space-x-2">
					<button
						onClick={refreshLogs}
						className="px-3 py-2 bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200"
						title="Refrescar datos"
					>
						<RefreshCw size={20} />
					</button>
					<button
						onClick={exportLogs}
						className="px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
						title="Exportar registros"
					>
						<Download size={20} />
					</button>
				</div>
			</div>

			{/* Tarjetas de resumen */}
			<StatCardList items={statItems} />

			{/* Filtros */}
			<div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
				<div className="flex items-center mb-2">
					<AlertTriangle className="w-5 h-5 text-gray-500 mr-2" />
					<h2 className="text-lg font-medium text-gray-900">
						Filtros
					</h2>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* Filtro por nivel */}
					<div>
						<label
							htmlFor="levelFilter"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Nivel
						</label>
						<select
							id="levelFilter"
							value={levelFilter}
							onChange={(e) => setLevelFilter(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
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
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Origen
						</label>
						<select
							id="sourceFilter"
							value={sourceFilter}
							onChange={(e) => setSourceFilter(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
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
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Fecha
						</label>
						<input
							type="date"
							id="dateFilter"
							value={dateFilter}
							onChange={(e) => setDateFilter(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
						/>
					</div>
				</div>

				<div className="flex justify-end">
					<button
						onClick={clearFilters}
						className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
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
					<div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] overflow-hidden">
						<div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
							<h3 className="text-lg font-medium text-gray-900">
								Detalles del Registro #{selectedLog.id}
							</h3>
							<button
								onClick={() => setSelectedLog(null)}
								className="text-gray-500 hover:text-gray-700"
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
									<p className="text-sm font-medium text-gray-500">
										Nivel
									</p>
									<p className="font-semibold text-gray-900">
										{selectedLog.level.toUpperCase()}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-gray-500">
										Fecha y Hora
									</p>
									<p className="font-semibold text-gray-900">
										{new Date(selectedLog.timestamp).toLocaleString()}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-gray-500">
										Origen
									</p>
									<p className="font-semibold text-gray-900">
										{selectedLog.source}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-gray-500">
										Usuario ID
									</p>
									<p className="font-semibold text-gray-900">
										{selectedLog.userId || "N/A"}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-gray-500">
										Dirección IP
									</p>
									<p className="font-semibold text-gray-900">
										{selectedLog.ip || "N/A"}
									</p>
								</div>
								<div className="md:col-span-2">
									<p className="text-sm font-medium text-gray-500">
										Mensaje
									</p>
									<p className="font-semibold text-gray-900">
										{selectedLog.message}
									</p>
								</div>
								<div className="md:col-span-2">
									<p className="text-sm font-medium text-gray-500">
										User Agent
									</p>
									<p className="font-semibold text-gray-900 break-words">
										{selectedLog.userAgent || "N/A"}
									</p>
								</div>
								<div className="md:col-span-2">
									<p className="text-sm font-medium text-gray-500">
										Detalles
									</p>
									<pre className="mt-2 p-3 bg-gray-100 rounded-md text-sm text-gray-900 overflow-x-auto">
										{selectedLog.details || "Sin detalles adicionales."}
									</pre>
								</div>
							</div>
						</div>
						<div className="px-6 py-3 border-t border-gray-200 flex justify-end">
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
