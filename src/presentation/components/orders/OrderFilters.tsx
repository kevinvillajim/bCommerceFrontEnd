import React from "react";
import {Search, Filter} from "lucide-react";

interface OrderFiltersProps {
	filters: {
		search: string;
		status: string;
		paymentStatus: string;
		dateFilter: string;
		dateFrom?: string;
		dateTo?: string;
	};
	onFilterChange: (name: string, value: string) => void;
	onClearFilters: () => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
	filters,
	onFilterChange,
	onClearFilters,
}) => {
	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const {name, value} = e.target;
		onFilterChange(name, value);
	};

	return (
		<div className="bg-white rounded-lg shadow-sm p-4">
			<div className="flex flex-col md:flex-row gap-4">
				{/* Buscador */}
				<div className="relative flex-grow">
					<input
						type="text"
						name="search"
						placeholder="Buscar por número de pedido, cliente..."
						className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
						value={filters.search}
						onChange={handleInputChange}
					/>
					<Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
				</div>

				{/* Filtro de Estado */}
				<div className="flex items-center space-x-2">
					<Filter className="h-5 w-5 text-gray-500" />
					<select
						name="status"
						className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
						value={filters.status}
						onChange={handleInputChange}
					>
						<option value="all">Todos los estados</option>
						<option value="pending">Pendientes</option>
						<option value="processing">En Proceso</option>
						<option value="paid">Pagados</option>
						<option value="shipped">Enviados</option>
						<option value="delivered">Entregados</option>
						<option value="completed">Completados</option>
						<option value="cancelled">Cancelados</option>
					</select>
				</div>

				{/* Filtro de Pago */}
				<div className="flex items-center space-x-2">
					<select
						name="paymentStatus"
						className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
						value={filters.paymentStatus}
						onChange={handleInputChange}
					>
						<option value="all">Todos los pagos</option>
						<option value="pending">Pago Pendiente</option>
						<option value="completed">Pagados</option>
						<option value="failed">Rechazados</option>
					</select>
				</div>

				{/* Filtro de Fecha */}
				<div className="flex items-center space-x-2">
					<select
						name="dateFilter"
						className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
						value={filters.dateFilter}
						onChange={handleInputChange}
					>
						<option value="all">Todas las fechas</option>
						<option value="today">Hoy</option>
						<option value="week">Esta semana</option>
						<option value="month">Este mes</option>
						<option value="custom">Personalizado</option>
					</select>

					{filters.dateFilter === "custom" && (
						<div className="flex items-center space-x-2">
							<input
								type="date"
								name="dateFrom"
								className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
								value={filters.dateFrom || ""}
								onChange={handleInputChange}
							/>
							<span className="text-gray-500">a</span>
							<input
								type="date"
								name="dateTo"
								className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
								value={filters.dateTo || ""}
								onChange={handleInputChange}
							/>
						</div>
					)}
				</div>

				{/* Botón para limpiar filtros */}
				<button
					onClick={onClearFilters}
					className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
				>
					Limpiar filtros
				</button>
			</div>
		</div>
	);
};

export default OrderFilters;
