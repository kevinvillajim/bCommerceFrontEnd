import React, {useState, useMemo} from "react";
import {Search, ArrowUp, ArrowDown} from "lucide-react";
import Pagination from "../dashboard/DashboardPagination";

// Definición del tipo de columna
interface Column<T> {
	key: string;
	header: string;
	render?: (item: T) => React.ReactNode;
	sortable?: boolean;
}

// Props del componente Table
interface TableProps<T> {
	data: T[];
	columns: Column<T>[];
	searchFields?: (keyof T)[];
	loading?: boolean;
	emptyMessage?: string;
	pagination?: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		itemsPerPage: number;
		onPageChange: (page: number) => void;
	};
}

function Table<T>({
	data,
	columns,
	searchFields = [],
	loading = false,
	emptyMessage = "No hay datos disponibles",
	pagination,
}: TableProps<T>) {
	const [searchTerm, setSearchTerm] = useState("");
	const [sortConfig, setSortConfig] = useState<{
		key: string;
		direction: "ascending" | "descending";
	} | null>(null);

	// Manejador de ordenación
	const handleSort = (key: string) => {
		let direction: "ascending" | "descending" = "ascending";

		if (sortConfig && sortConfig.key === key) {
			direction =
				sortConfig.direction === "ascending" ? "descending" : "ascending";
		}

		setSortConfig({key, direction});
	};

	// Aplicar búsqueda y ordenación a los datos
	const filteredAndSortedData = useMemo(() => {
		// Primero, filtrar los datos basados en el término de búsqueda
		let filtered = [...data];

		if (searchTerm && searchFields.length > 0) {
			filtered = data.filter((item) =>
				searchFields.some((field) => {
					const value = item[field];
					return (
						value &&
						String(value).toLowerCase().includes(searchTerm.toLowerCase())
					);
				})
			);
		}

		// Luego, ordenar los datos filtrados
		if (sortConfig) {
			filtered.sort((a, b) => {
				const aValue = a[sortConfig.key as keyof T];
				const bValue = b[sortConfig.key as keyof T];

				if (aValue < bValue) {
					return sortConfig.direction === "ascending" ? -1 : 1;
				}
				if (aValue > bValue) {
					return sortConfig.direction === "ascending" ? 1 : -1;
				}
				return 0;
			});
		}

		return filtered;
	}, [data, searchTerm, searchFields, sortConfig]);

	return (
		<div className="space-y-4">
			{/* Búsqueda */}
			{searchFields.length > 0 && (
				<div className="relative">
					<input
						type="text"
						placeholder="Buscar..."
						className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
					<Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
				</div>
			)}

			{/* Tabla */}
			<div className="bg-white rounded-lg shadow-sm overflow-hidden">
				{loading ? (
					<div className="p-8 flex justify-center">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
					</div>
				) : filteredAndSortedData.length === 0 ? (
					<div className="p-8 text-center">
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							{emptyMessage}
						</h3>
						<p className="text-gray-500">
							Intente ajustar su búsqueda para encontrar lo que está buscando.
						</p>
					</div>
				) : (
					<>
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										{columns.map((column) => (
											<th
												key={column.key}
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												<div className="flex items-center space-x-1">
													<span>{column.header}</span>
													{column.sortable && (
														<button
															onClick={() => handleSort(column.key)}
															className="ml-1 focus:outline-none"
														>
															{sortConfig?.key === column.key ? (
																sortConfig.direction === "ascending" ? (
																	<ArrowUp
																		size={14}
																		className="text-primary-500"
																	/>
																) : (
																	<ArrowDown
																		size={14}
																		className="text-primary-500"
																	/>
																)
															) : (
																<div className="h-3.5 w-3.5" /> // Espacio para alineación
															)}
														</button>
													)}
												</div>
											</th>
										))}
									</tr>
								</thead>
								<tbody className="bg-whitedivide-y divide-gray-200">
									{filteredAndSortedData.map((item, index) => (
										<tr
											key={index}
											className="hover:bg-gray-50"
										>
											{columns.map((column) => (
												<td
													key={column.key}
													className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
												>
													{column.render
														? column.render(item)
														: String(item[column.key as keyof T] || "")}
												</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Paginación */}
						{pagination && (
							<div className="px-6 py-3 flex justify-between items-center border-t border-gray-200">
								<div>
									<p className="text-sm text-gray-700">
										Mostrando{" "}
										<span className="font-medium">
											{(pagination.currentPage - 1) * pagination.itemsPerPage +
												1}
										</span>{" "}
										a{" "}
										<span className="font-medium">
											{Math.min(
												pagination.currentPage * pagination.itemsPerPage,
												pagination.totalItems
											)}
										</span>{" "}
										de{" "}
										<span className="font-medium">{pagination.totalItems}</span>{" "}
										elementos
									</p>
								</div>
								<Pagination
									currentPage={pagination.currentPage}
									totalPages={pagination.totalPages}
									onPageChange={pagination.onPageChange}
								/>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}

export default Table;
