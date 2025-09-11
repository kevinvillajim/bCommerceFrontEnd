import React, {useState, useEffect} from "react";
import {
  Download,
  RefreshCw,
  Eye,
  Clock,
  Server,
  User,
  Info,
  XCircle,
  AlertTriangle,
  Filter,
  Trash2,
  Trash,
} from "lucide-react";
import Table from "../../components/dashboard/Table";
import StatCardList from "../../components/dashboard/StatCardList";
import { AdminLogService } from "../../../infrastructure/services/AdminLogService";
import { AdminLogEntity } from "../../../core/domain/entities/AdminLog";
import type { AdminLogFilters } from "../../../core/domain/entities/AdminLog";

const adminLogService = new AdminLogService();

// Página de Visualización de Registros de Errores
const AdminLogViewerPage: React.FC = () => {
	// Estados
	const [logs, setLogs] = useState<AdminLogEntity[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [selectedLog, setSelectedLog] = useState<AdminLogEntity | null>(null);
	const [stats, setStats] = useState<any>(null);
	const [totalPages, setTotalPages] = useState<number>(1);
	const [totalItems, setTotalItems] = useState<number>(0);
	const [eventTypes, setEventTypes] = useState<string[]>([]);
	const [logUsers, setLogUsers] = useState<any[]>([]);
	
	// Filtros
	const [filters, setFilters] = useState<AdminLogFilters>({
		page: 1,
		per_page: 20,
		level: undefined,
		event_type: undefined,
		user_id: undefined,
		status_code: undefined,
		from_date: undefined,
		to_date: undefined,
		search: undefined,
	});

	// Opciones para filtros
	const levels = ["error", "critical", "warning", "info"];
	const statusCodes = [401, 403, 404, 429, 500, 502, 503, 504];

	// Columnas para la tabla
	const columns = [
		{
			key: "id",
			header: "ID",
			sortable: true,
		},
		{
			key: "createdAt",
			header: "Fecha y Hora",
			sortable: true,
			render: (log: AdminLogEntity) => (
				<div className="flex items-center">
					<Clock className="w-4 h-4 mr-1 text-gray-400" />
					<div className="flex flex-col">
						<span className="text-sm">{log.getFormattedDate()}</span>
						<span className="text-xs text-gray-500">{log.timeAgo}</span>
					</div>
				</div>
			),
		},
		{
			key: "level",
			header: "Nivel",
			sortable: true,
			render: (log: AdminLogEntity) => (
				<span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${log.getLevelColor()}`}>
					{log.getLevelIcon()} {log.level.toUpperCase()}
				</span>
			),
		},
		{
			key: "eventType",
			header: "Tipo de Evento",
			sortable: true,
			render: (log: AdminLogEntity) => (
				<div className="flex items-center">
					<Server className="w-4 h-4 mr-1 text-gray-400" />
					<span className="text-sm">{log.getEventTypeDisplayName()}</span>
				</div>
			),
		},
		{
			key: "message",
			header: "Mensaje",
			sortable: true,
			render: (log: AdminLogEntity) => (
				<div className="max-w-xs">
					<p className="text-sm text-gray-900 truncate" title={log.message}>
						{log.getShortMessage(60)}
					</p>
				</div>
			),
		},
		{
			key: "user",
			header: "Usuario",
			sortable: true,
			render: (log: AdminLogEntity) => (
				<div className="flex items-center">
					<User className="w-4 h-4 mr-1 text-gray-400" />
					<span className="text-sm">{log.getUserDisplayName()}</span>
				</div>
			),
		},
		{
			key: "statusCode",
			header: "Estado",
			sortable: true,
			render: (log: AdminLogEntity) => (
				<span className={`px-2 py-1 text-xs rounded ${
					!log.statusCode ? 'bg-gray-100 text-gray-600' :
					log.statusCode >= 500 ? 'bg-red-100 text-red-800' :
					log.statusCode >= 400 ? 'bg-yellow-100 text-yellow-800' :
					'bg-green-100 text-green-800'
				}`}>
					{log.statusCode || 'N/A'}
				</span>
			),
		},
		{
			key: "actions",
			header: "Acciones",
			render: (log: AdminLogEntity) => (
				<div className="flex space-x-2">
					<button
						onClick={() => setSelectedLog(log)}
						className="text-primary-600 hover:text-primary-900"
						title="Ver detalles"
					>
						<Eye size={16} />
					</button>
					<button
						onClick={() => handleDeleteLog(log.id)}
						className="text-red-600 hover:text-red-900"
						title="Eliminar log"
					>
						<Trash2 size={16} />
					</button>
				</div>
			),
		},
	];

	// Cargar datos iniciales
	const loadInitialData = async () => {
		try {
			const [statsResult, eventTypesResult, logUsersResult] = await Promise.all([
				adminLogService.getStats(),
				adminLogService.getEventTypes(),
				adminLogService.getLogUsers(),
			]);
			
			setStats(statsResult);
			setEventTypes(eventTypesResult);
			setLogUsers(logUsersResult);
		} catch (error) {
			console.error('Error loading initial data:', error);
		}
	};

	// Cargar logs con filtros
	const loadLogs = async (newFilters: AdminLogFilters = filters) => {
		try {
			setLoading(true);
			const result = await adminLogService.getLogs(newFilters);
			
			setLogs(result.logs);
			setTotalPages(result.lastPage);
			setTotalItems(result.total);
			setCurrentPage(result.currentPage);
		} catch (error) {
			console.error('Error loading logs:', error);
			// En caso de error, mostrar array vacío
			setLogs([]);
		} finally {
			setLoading(false);
		}
	};

	// Cargar datos al montar el componente
	useEffect(() => {
		loadInitialData();
		loadLogs();
	}, []);

	// Recargar logs cuando cambien los filtros
	useEffect(() => {
		loadLogs(filters);
	}, [filters]);

	// Manejar cambios en filtros
	const handleFilterChange = (key: keyof AdminLogFilters, value: any) => {
		const newFilters = {
			...filters,
			[key]: value === '' || value === 'all' ? undefined : value,
			page: 1, // Resetear página al cambiar filtros
		};
		setFilters(newFilters);
	};

	// Manejar cambio de página
	const handlePageChange = (page: number) => {
		const newFilters = { ...filters, page };
		setFilters(newFilters);
	};

	// Eliminar log
	const handleDeleteLog = async (logId: number) => {
		if (!confirm('¿Estás seguro de que quieres eliminar este log?')) {
			return;
		}
		
		try {
			await adminLogService.deleteLog(logId);
			// Recargar logs después de eliminar
			await loadLogs();
			await loadInitialData(); // Recargar stats
		} catch (error) {
			console.error('Error deleting log:', error);
			alert('Error al eliminar el log');
		}
	};

	// Eliminar todos los logs
	const handleDeleteAllLogs = async () => {
		if (!confirm('⚠️ ¿Estás seguro de que quieres BORRAR TODOS LOS LOGS?\n\nEsta acción no se puede deshacer y eliminará todos los registros de errores del sistema.')) {
			return;
		}
		
		try {
			// Call the cleanup endpoint with days=0 to delete all logs
			await adminLogService.cleanupLogs({ days: 0 });
			
			// Clear the UI
			setLogs([]);
			setSelectedLog(null);
			
			// Refresh stats
			await loadInitialData();
			
			alert('✅ Todos los logs han sido eliminados correctamente.');
		} catch (error) {
			console.error('Error eliminando todos los logs:', error);
			alert('❌ Error al eliminar los logs. Por favor intenta nuevamente.');
		}
	};

	// Refrescar logs
	const refreshLogs = async () => {
		await loadLogs();
		await loadInitialData();
	};

	// Limpiar filtros
	const clearFilters = () => {
		setFilters({
			page: 1,
			per_page: 20,
			level: undefined,
			event_type: undefined,
			user_id: undefined,
			status_code: undefined,
			from_date: undefined,
			to_date: undefined,
			search: undefined,
		});
	};

	// Helper function to convert logs to CSV format
	const convertLogsToCSV = (logs: AdminLogEntity[]): string => {
		if (logs.length === 0) return '';

		// CSV headers
		const headers = [
			'ID',
			'Fecha',
			'Nivel',
			'Tipo de Evento',
			'Mensaje',
			'Usuario',
			'Email Usuario',
			'Código de Estado',
			'Método HTTP',
			'URL',
			'IP',
			'User Agent',
			'Contexto'
		];

		// Convert logs to CSV rows
		const csvRows = logs.map(log => [
			log.id,
			log.getFormattedDate(),
			log.level,
			log.eventType || '',
			`"${log.message.replace(/"/g, '""')}"`, // Escape quotes in message
			log.user?.name || '',
			log.user?.email || '',
			log.statusCode || '',
			log.method || '',
			`"${(log.url || '').replace(/"/g, '""')}"`, // Escape quotes in URL
			log.ipAddress || '',
			`"${(log.userAgent || '').replace(/"/g, '""')}"`, // Escape quotes in user agent
			log.hasContext() ? `"${JSON.stringify(log.context).replace(/"/g, '""')}"` : ''
		]);

		// Combine headers and rows
		return [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');
	};

	// Exportar logs como CSV
	const exportLogs = async () => {
		try {
			const allLogs: AdminLogEntity[] = [];
			let currentPage = 1;
			const maxPerPage = 100; // Backend limit
			let hasMorePages = true;

			// Fetch all logs in batches
			while (hasMorePages) {
				const exportFilters = { 
					...filters, 
					per_page: maxPerPage, 
					page: currentPage 
				};
				
				const result = await adminLogService.getLogs(exportFilters);
				allLogs.push(...result.logs);
				
				// Check if there are more pages
				hasMorePages = currentPage < result.lastPage;
				currentPage++;
			}
			
			if (allLogs.length === 0) {
				alert('No hay logs para exportar con los filtros actuales');
				return;
			}

			// Convert to CSV
			const csvContent = convertLogsToCSV(allLogs);
			
			// Create and download CSV file
			const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
			const url = URL.createObjectURL(blob);
			const exportFileDefaultName = `admin_logs_export_${new Date().toISOString().slice(0, 10)}.csv`;
			
			const linkElement = document.createElement("a");
			linkElement.setAttribute("href", url);
			linkElement.setAttribute("download", exportFileDefaultName);
			linkElement.click();
			
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Error exporting logs:', error);
			alert('Error al exportar los logs');
		}
	};

	// Estadísticas para las tarjetas
	const statItems = stats ? [
		{ 
		  title: "Total", 
		  value: stats.total || 0, 
		  description: "Total de registros", 
		  icon: Info, 
		  bgColor: "bg-gray-50/20", 
		  textColor: "text-gray-700", 
		  valueColor: "text-gray-800", 
		  descriptionColor: "text-gray-600", 
		  iconColor: "text-gray-600", 
		},
		{ 
		  title: "Críticos", 
		  value: stats.critical || 0, 
		  description: "Registros críticos", 
		  icon: AlertTriangle, 
		  bgColor: "bg-red-50/20", 
		  textColor: "text-red-700", 
		  valueColor: "text-red-800", 
		  descriptionColor: "text-red-600", 
		  iconColor: "text-red-600", 
		},
		{ 
		  title: "Errores", 
		  value: stats.errors || 0, 
		  description: "Registros de error", 
		  icon: XCircle, 
		  bgColor: "bg-orange-50/20", 
		  textColor: "text-orange-700", 
		  valueColor: "text-orange-800", 
		  descriptionColor: "text-orange-600", 
		  iconColor: "text-orange-600", 
		},
		{ 
		  title: "Hoy", 
		  value: stats.today || 0, 
		  description: "Registros de hoy", 
		  icon: Clock, 
		  bgColor: "bg-blue-50/20", 
		  textColor: "text-blue-700", 
		  valueColor: "text-blue-800", 
		  descriptionColor: "text-blue-600", 
		  iconColor: "text-blue-600", 
		}
	  ] : [];

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
						title="Exportar registros como CSV"
					>
						<Download size={20} />
					</button>
					<button
						onClick={handleDeleteAllLogs}
						className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
						title="Borrar todos los logs"
					>
						<Trash size={20} />
					</button>
				</div>
			</div>

			{/* Tarjetas de resumen */}
			{statItems.length > 0 && <StatCardList items={statItems} />}

			{/* Filtros */}
			<div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
				<div className="flex items-center mb-2">
					<Filter className="w-5 h-5 text-gray-500 mr-2" />
					<h2 className="text-lg font-medium text-gray-900">
						Filtros
					</h2>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
					{/* Filtro por nivel */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Nivel
						</label>
						<select
							value={filters.level || 'all'}
							onChange={(e) => handleFilterChange('level', e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
						>
							<option value="all">Todos</option>
							{levels.map((level) => (
								<option key={level} value={level}>
									{level.charAt(0).toUpperCase() + level.slice(1)}
								</option>
							))}
						</select>
					</div>

					{/* Filtro por tipo de evento */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Tipo de Evento
						</label>
						<select
							value={filters.event_type || 'all'}
							onChange={(e) => handleFilterChange('event_type', e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
						>
							<option value="all">Todos</option>
							{eventTypes.map((eventType) => (
								<option key={eventType} value={eventType}>
									{eventType.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
								</option>
							))}
						</select>
					</div>

					{/* Filtro por usuario */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Usuario
						</label>
						<select
							value={filters.user_id || 'all'}
							onChange={(e) => handleFilterChange('user_id', e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
						>
							<option value="all">Todos</option>
							{logUsers.map((user) => (
								<option key={user.id} value={user.id}>
									{user.name || user.email}
								</option>
							))}
						</select>
					</div>

					{/* Filtro por código de estado */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Código HTTP
						</label>
						<select
							value={filters.status_code || 'all'}
							onChange={(e) => handleFilterChange('status_code', e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
						>
							<option value="all">Todos</option>
							{statusCodes.map((code) => (
								<option key={code} value={code}>
									{code}
								</option>
							))}
						</select>
					</div>

					{/* Filtro fecha desde */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Desde
						</label>
						<input
							type="date"
							value={filters.from_date || ''}
							onChange={(e) => handleFilterChange('from_date', e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
						/>
					</div>

					{/* Filtro fecha hasta */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Hasta
						</label>
						<input
							type="date"
							value={filters.to_date || ''}
							onChange={(e) => handleFilterChange('to_date', e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
						/>
					</div>
				</div>

				{/* Búsqueda de texto */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Buscar en mensajes, URLs y eventos
					</label>
					<input
						type="text"
						value={filters.search || ''}
						onChange={(e) => handleFilterChange('search', e.target.value)}
						placeholder="Escribir para buscar..."
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
					/>
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
				data={logs}
				columns={columns}
				loading={loading}
				emptyMessage="No se encontraron registros de errores"
				pagination={{
					currentPage,
					totalPages,
					totalItems,
					itemsPerPage: filters.per_page || 20,
					onPageChange: handlePageChange,
				}}
			/>

			{/* Modal de detalles */}
			{selectedLog && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
						<div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
							<div className="flex items-center space-x-3">
								<span className={`px-2 py-1 text-xs rounded-full ${selectedLog.getLevelColor()}`}>
									{selectedLog.getLevelIcon()} {selectedLog.level.toUpperCase()}
								</span>
								<h3 className="text-lg font-medium text-gray-900">
									Detalles del Log #{selectedLog.id}
								</h3>
							</div>
							<button
								onClick={() => setSelectedLog(null)}
								className="text-gray-500 hover:text-gray-700"
							>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
						<div className="px-6 py-4 overflow-y-auto max-h-[70vh]">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
								<div>
									<p className="text-sm font-medium text-gray-500 mb-1">Fecha y Hora</p>
									<p className="font-semibold text-gray-900">{selectedLog.getFormattedDate()}</p>
									<p className="text-sm text-gray-500">{selectedLog.timeAgo}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-gray-500 mb-1">Tipo de Evento</p>
									<p className="font-semibold text-gray-900">{selectedLog.getEventTypeDisplayName()}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-gray-500 mb-1">Usuario</p>
									<p className="font-semibold text-gray-900">{selectedLog.getUserDisplayName()}</p>
									{selectedLog.user?.email && (
										<p className="text-sm text-gray-500">{selectedLog.user.email}</p>
									)}
								</div>
								<div>
									<p className="text-sm font-medium text-gray-500 mb-1">Código de Estado</p>
									<p className="font-semibold text-gray-900">{selectedLog.statusCode || 'N/A'}</p>
								</div>
								{selectedLog.method && (
									<div>
										<p className="text-sm font-medium text-gray-500 mb-1">Método HTTP</p>
										<p className="font-semibold text-gray-900">{selectedLog.method}</p>
									</div>
								)}
								{selectedLog.ipAddress && (
									<div>
										<p className="text-sm font-medium text-gray-500 mb-1">Dirección IP</p>
										<p className="font-semibold text-gray-900">{selectedLog.ipAddress}</p>
									</div>
								)}
							</div>

							{selectedLog.url && (
								<div className="mb-4">
									<p className="text-sm font-medium text-gray-500 mb-1">URL</p>
									<p className="font-semibold text-gray-900 break-all">{selectedLog.url}</p>
								</div>
							)}

							<div className="mb-4">
								<p className="text-sm font-medium text-gray-500 mb-1">Mensaje</p>
								<p className="font-semibold text-gray-900 whitespace-pre-wrap">{selectedLog.message}</p>
							</div>

							{selectedLog.userAgent && (
								<div className="mb-4">
									<p className="text-sm font-medium text-gray-500 mb-1">User Agent</p>
									<p className="text-sm text-gray-900 break-words bg-gray-50 p-2 rounded">{selectedLog.userAgent}</p>
								</div>
							)}

							{selectedLog.hasContext() && (
								<div className="mb-4">
									<p className="text-sm font-medium text-gray-500 mb-1">Contexto Adicional</p>
									<pre className="mt-2 p-3 bg-gray-100 rounded-md text-sm text-gray-900 overflow-x-auto max-h-60">
										{JSON.stringify(selectedLog.context, null, 2)}
									</pre>
								</div>
							)}
						</div>
						<div className="px-6 py-3 border-t border-gray-200 flex justify-end space-x-3">
							<button
								onClick={() => handleDeleteLog(selectedLog.id)}
								className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
							>
								Eliminar Log
							</button>
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
