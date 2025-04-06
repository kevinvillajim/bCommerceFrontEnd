import React, {useState, useEffect} from "react";
import {
	DollarSign,
	Filter,
	FileText,
	TrendingUp,
	BarChart2,
} from "lucide-react";
import Table from "../../components/dashboard/Table";
import type {
	AccountingTransaction,
	AccountingAccount,
} from "../../../core/domain/entities/Accounting";

/**
 * Página de administración de contabilidad
 * Muestra transacciones contables y resumen financiero
 */
const AdminAccountingPage: React.FC = () => {
	// Estados para las diferentes secciones
	const [activeTab, setActiveTab] = useState<
		"transactions" | "accounts" | "reports"
	>("transactions");
	const [loading, setLoading] = useState<boolean>(true);
	const [transactions, setTransactions] = useState<AccountingTransaction[]>([]);
	const [accounts, setAccounts] = useState<AccountingAccount[]>([]);
	// Obtener fechas para el rango por defecto (1 mes atrás hasta hoy)
	const oneMonthAgo = new Date();
	oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
	const today = new Date();

	const [dateRange, setDateRange] = useState<{from: string; to: string}>({
		from: oneMonthAgo.toISOString().split("T")[0],
		to: today.toISOString().split("T")[0],
	});
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalPages, setTotalPages] = useState<number>(1);
	const [filterType, setFilterType] = useState<string>("all");

	// Eliminar variable account no utilizada de los reportes
	const isReportItemUnused = {
		unused: false, // Esta línea no hace nada, solo es para mantener la coherencia
	};

	// Datos de ejemplo para el desarrollo
	useEffect(() => {
		// Simulación de carga de datos desde API
		setLoading(true);

		setTimeout(() => {
			// Datos de ejemplo para transacciones
			const mockTransactions: AccountingTransaction[] = [
				{
					id: 1,
					referenceNumber: "TRANS-001",
					transactionDate: "2025-04-01",
					description: "Venta de productos",
					type: "Venta",
					orderId: 1001,
					isPosted: true,
					entries: [
						{
							id: 1,
							transactionId: 1,
							accountId: 1001,
							debitAmount: 0,
							creditAmount: 1500.0,
							notes: "Venta de productos",
						},
						{
							id: 2,
							transactionId: 1,
							accountId: 5001,
							debitAmount: 1500.0,
							creditAmount: 0,
							notes: "Efectivo recibido",
						},
					],
					balance: 0,
					isBalanced: true,
				},
				{
					id: 2,
					referenceNumber: "TRANS-002",
					transactionDate: "2025-04-02",
					description: "Pago a proveedor",
					type: "Compra",
					isPosted: true,
					entries: [
						{
							id: 3,
							transactionId: 2,
							accountId: 2001,
							debitAmount: 750.0,
							creditAmount: 0,
							notes: "Compra de inventario",
						},
						{
							id: 4,
							transactionId: 2,
							accountId: 5001,
							debitAmount: 0,
							creditAmount: 750.0,
							notes: "Pago efectuado",
						},
					],
					balance: 0,
					isBalanced: true,
				},
				{
					id: 3,
					referenceNumber: "TRANS-003",
					transactionDate: "2025-04-03",
					description: "Pago de impuestos",
					type: "Gasto",
					isPosted: true,
					entries: [
						{
							id: 5,
							transactionId: 3,
							accountId: 3001,
							debitAmount: 350.0,
							creditAmount: 0,
							notes: "Impuestos mensuales",
						},
						{
							id: 6,
							transactionId: 3,
							accountId: 5001,
							debitAmount: 0,
							creditAmount: 350.0,
							notes: "Pago de impuestos",
						},
					],
					balance: 0,
					isBalanced: true,
				},
				{
					id: 4,
					referenceNumber: "TRANS-004",
					transactionDate: "2025-04-04",
					description: "Devolución de producto",
					type: "Devolución",
					orderId: 1002,
					isPosted: false,
					entries: [
						{
							id: 7,
							transactionId: 4,
							accountId: 1001,
							debitAmount: 200.0,
							creditAmount: 0,
							notes: "Devolución de venta",
						},
						{
							id: 8,
							transactionId: 4,
							accountId: 5001,
							debitAmount: 0,
							creditAmount: 200.0,
							notes: "Reembolso efectuado",
						},
					],
					balance: 0,
					isBalanced: true,
				},
				{
					id: 5,
					referenceNumber: "TRANS-005",
					transactionDate: "2025-04-05",
					description: "Pago de comisiones",
					type: "Gasto",
					isPosted: true,
					entries: [
						{
							id: 9,
							transactionId: 5,
							accountId: 3002,
							debitAmount: 300.0,
							creditAmount: 0,
							notes: "Comisiones a vendedores",
						},
						{
							id: 10,
							transactionId: 5,
							accountId: 5001,
							debitAmount: 0,
							creditAmount: 300.0,
							notes: "Pago de comisiones",
						},
					],
					balance: 0,
					isBalanced: true,
				},
			];

			// Datos de ejemplo para cuentas contables
			const mockAccounts: AccountingAccount[] = [
				{
					id: 1001,
					code: "4000",
					name: "Ventas",
					type: "Ingreso",
					description: "Ingresos por ventas de productos",
					isActive: true,
					balance: 15000.0,
				},
				{
					id: 2001,
					code: "5000",
					name: "Costo de Ventas",
					type: "Costo",
					description: "Costos asociados a ventas",
					isActive: true,
					balance: 7500.0,
				},
				{
					id: 3001,
					code: "6000",
					name: "Gastos Impuestos",
					type: "Gasto",
					description: "Pagos de impuestos",
					isActive: true,
					balance: 1250.0,
				},
				{
					id: 3002,
					code: "6100",
					name: "Comisiones",
					type: "Gasto",
					description: "Comisiones a vendedores",
					isActive: true,
					balance: 950.0,
				},
				{
					id: 5001,
					code: "1000",
					name: "Efectivo",
					type: "Activo",
					description: "Cuenta de efectivo",
					isActive: true,
					balance: 25000.0,
				},
				{
					id: 5002,
					code: "1100",
					name: "Cuentas por Cobrar",
					type: "Activo",
					description: "Cuentas pendientes de cobro",
					isActive: true,
					balance: 3500.0,
				},
				{
					id: 5003,
					code: "2000",
					name: "Cuentas por Pagar",
					type: "Pasivo",
					description: "Cuentas pendientes de pago",
					isActive: true,
					balance: 2300.0,
				},
			];

			setTransactions(mockTransactions);
			setAccounts(mockAccounts);
			setTotalPages(3); // Simulación de paginación
			setLoading(false);
		}, 1000);
	}, [currentPage, filterType, dateRange]);

	// Columnas para la tabla de transacciones
	const transactionColumns = [
		{
			key: "referenceNumber",
			header: "Referencia",
			render: (transaction: AccountingTransaction) => (
				<span className="font-medium text-primary-600 dark:text-primary-400">
					{transaction.referenceNumber}
				</span>
			),
			sortable: true,
		},
		{
			key: "transactionDate",
			header: "Fecha",
			render: (transaction: AccountingTransaction) => (
				<span>
					{new Date(transaction.transactionDate).toLocaleDateString("es-ES")}
				</span>
			),
			sortable: true,
		},
		{
			key: "description",
			header: "Descripción",
			sortable: true,
		},
		{
			key: "type",
			header: "Tipo",
			render: (transaction: AccountingTransaction) => (
				<span
					className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          ${
						transaction.type === "Venta"
							? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
							: transaction.type === "Compra"
								? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
								: transaction.type === "Gasto"
									? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
									: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
					}`}
				>
					{transaction.type}
				</span>
			),
			sortable: true,
		},
		{
			key: "isPosted",
			header: "Estado",
			render: (transaction: AccountingTransaction) => (
				<span
					className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          ${transaction.isPosted ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"}`}
				>
					{transaction.isPosted ? "Contabilizado" : "Pendiente"}
				</span>
			),
			sortable: true,
		},
		{
			key: "actions",
			header: "Acciones",
			render: (transaction: AccountingTransaction) => (
				<div className="flex space-x-2">
					<button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-200">
						<FileText size={16} />
					</button>
					{!transaction.isPosted && (
						<button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200">
							<TrendingUp size={16} />
						</button>
					)}
				</div>
			),
		},
	];

	// Columnas para la tabla de cuentas
	const accountColumns = [
		{
			key: "code",
			header: "Código",
			render: (account: AccountingAccount) => (
				<span className="font-medium text-primary-600 dark:text-primary-400">
					{account.code}
				</span>
			),
			sortable: true,
		},
		{
			key: "name",
			header: "Nombre",
			sortable: true,
		},
		{
			key: "type",
			header: "Tipo",
			render: (account: AccountingAccount) => (
				<span
					className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          ${
						account.type === "Activo"
							? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
							: account.type === "Pasivo"
								? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
								: account.type === "Ingreso"
									? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
									: account.type === "Gasto"
										? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
										: account.type === "Costo"
											? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
											: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
					}`}
				>
					{account.type}
				</span>
			),
			sortable: true,
		},
		{
			key: "balance",
			header: "Saldo",
			render: (account: AccountingAccount) => {
				// Verificar si balance existe y proporcionar un valor predeterminado
				const balance = account.balance ?? 0;
				return (
					<span
						className={`font-medium ${balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
					>
						{balance.toLocaleString("es-ES", {
							style: "currency",
							currency: "USD",
						})}
					</span>
				);
			},
			sortable: true,
		},
		{
			key: "isActive",
			header: "Estado",
			render: (account: AccountingAccount) => (
				<span
					className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          ${account.isActive ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"}`}
				>
					{account.isActive ? "Activa" : "Inactiva"}
				</span>
			),
			sortable: true,
		},
		{
			key: "actions",
			header: "Acciones",
			render: (account: AccountingAccount) => (
				<div className="flex space-x-2">
					<button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-200">
						<FileText size={16} />
					</button>
				</div>
			),
		},
	];

	// Función para formatear los números como moneda
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("es-ES", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 2,
		}).format(amount);
	};

	// Cálculos para el panel de resumen financiero
	const financialSummary = {
		income: 15000.0,
		expenses: 2200.0,
		balance: 12800.0,
		netProfit: 7500.0,
		netProfitPercentage: 50.0,
		pendingTransactions: 1,
	};

	return (
		<div>
			<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
				Gestión Contable
			</h1>

			{/* Tarjetas de resumen */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex items-start justify-between">
					<div>
						<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
							Ingresos Totales
						</p>
						<p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
							{formatCurrency(financialSummary.income)}
						</p>
					</div>
					<div className="p-3 bg-green-50 dark:bg-green-900 rounded-lg">
						<DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
					</div>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex items-start justify-between">
					<div>
						<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
							Gastos Totales
						</p>
						<p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
							{formatCurrency(financialSummary.expenses)}
						</p>
					</div>
					<div className="p-3 bg-red-50 dark:bg-red-900 rounded-lg">
						<DollarSign className="w-6 h-6 text-red-600 dark:text-red-400" />
					</div>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex items-start justify-between">
					<div>
						<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
							Balance
						</p>
						<p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
							{formatCurrency(financialSummary.balance)}
						</p>
					</div>
					<div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
						<BarChart2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
					</div>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex items-start justify-between">
					<div>
						<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
							Beneficio Neto
						</p>
						<p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
							{formatCurrency(financialSummary.netProfit)}
						</p>
						<div className="flex items-center mt-2 text-green-600 dark:text-green-400">
							<TrendingUp size={16} />
							<span className="ml-1 text-sm font-medium">
								{financialSummary.netProfitPercentage}%
							</span>
						</div>
					</div>
					<div className="p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
						<DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
					</div>
				</div>
			</div>

			{/* Pestañas */}
			<div className="mb-6">
				<div className="border-b border-gray-200 dark:border-gray-700">
					<nav className="-mb-px flex space-x-8">
						<button
							onClick={() => setActiveTab("transactions")}
							className={`py-4 px-1 border-b-2 font-medium text-sm ${
								activeTab === "transactions"
									? "border-primary-500 text-primary-600 dark:text-primary-400 dark:border-primary-400"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
							}`}
						>
							Transacciones
						</button>
						<button
							onClick={() => setActiveTab("accounts")}
							className={`py-4 px-1 border-b-2 font-medium text-sm ${
								activeTab === "accounts"
									? "border-primary-500 text-primary-600 dark:text-primary-400 dark:border-primary-400"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
							}`}
						>
							Plan Contable
						</button>
						<button
							onClick={() => setActiveTab("reports")}
							className={`py-4 px-1 border-b-2 font-medium text-sm ${
								activeTab === "reports"
									? "border-primary-500 text-primary-600 dark:text-primary-400 dark:border-primary-400"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
							}`}
						>
							Reportes
						</button>
					</nav>
				</div>
			</div>

			{/* Filtros */}
			{activeTab === "transactions" && (
				<div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
					<div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
						<div className="flex items-center">
							<Filter className="h-5 w-5 text-gray-400 mr-2" />
							<span className="text-gray-700 dark:text-gray-300">Filtrar:</span>
						</div>

						<div className="flex flex-wrap gap-4">
							<div>
								<label
									htmlFor="dateFrom"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Fecha desde
								</label>
								<input
									type="date"
									id="dateFrom"
									value={dateRange.from}
									onChange={(e) =>
										setDateRange({...dateRange, from: e.target.value})
									}
									className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm dark:bg-gray-700 dark:text-white"
								/>
							</div>

							<div>
								<label
									htmlFor="dateTo"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Fecha hasta
								</label>
								<input
									type="date"
									id="dateTo"
									value={dateRange.to}
									onChange={(e) =>
										setDateRange({...dateRange, to: e.target.value})
									}
									className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm dark:bg-gray-700 dark:text-white"
								/>
							</div>

							<div>
								<label
									htmlFor="type"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Tipo
								</label>
								<select
									id="type"
									value={filterType}
									onChange={(e) => setFilterType(e.target.value)}
									className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm dark:bg-gray-700 dark:text-white"
								>
									<option value="all">Todos</option>
									<option value="venta">Venta</option>
									<option value="compra">Compra</option>
									<option value="gasto">Gasto</option>
									<option value="devolucion">Devolución</option>
								</select>
							</div>

							<div>
								<label
									htmlFor="status"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Estado
								</label>
								<select
									id="status"
									className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm dark:bg-gray-700 dark:text-white"
								>
									<option value="all">Todos</option>
									<option value="posted">Contabilizados</option>
									<option value="pending">Pendientes</option>
								</select>
							</div>
						</div>

						<div className="ml-auto">
							<button
								type="button"
								className="px-4 py-2 bg-primary-600 border border-transparent rounded-md font-medium text-white shadow-sm hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800"
							>
								Nueva Transacción
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Contenido de pestañas */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
				{activeTab === "transactions" && (
					<Table
						data={transactions}
						columns={transactionColumns}
						loading={loading}
						searchFields={["referenceNumber", "description", "type"]}
						emptyMessage="No hay transacciones disponibles para los filtros aplicados"
						pagination={{
							currentPage,
							totalPages,
							totalItems: transactions.length,
							itemsPerPage: 10,
							onPageChange: setCurrentPage,
						}}
					/>
				)}

				{activeTab === "accounts" && (
					<div>
						<div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
							<h2 className="text-lg font-medium text-gray-900 dark:text-white">
								Plan de Cuentas
							</h2>
							<button
								type="button"
								className="px-4 py-2 bg-primary-600 border border-transparent rounded-md font-medium text-white shadow-sm hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800"
							>
								Nueva Cuenta
							</button>
						</div>
						<Table
							data={accounts}
							columns={accountColumns}
							loading={loading}
							searchFields={["code", "name", "type"]}
							emptyMessage="No hay cuentas disponibles"
							pagination={{
								currentPage,
								totalPages,
								totalItems: accounts.length,
								itemsPerPage: 10,
								onPageChange: setCurrentPage,
							}}
						/>
					</div>
				)}

				{activeTab === "reports" && (
					<div className="p-6">
						<h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
							Informes Financieros
						</h2>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-600">
								<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
									Balance General
								</h3>
								<p className="text-gray-600 dark:text-gray-300 mb-4">
									Resumen de activos, pasivos y patrimonio de la empresa.
								</p>
								<button
									type="button"
									className="px-4 py-2 bg-primary-600 border border-transparent rounded-md font-medium text-white shadow-sm hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 w-full"
								>
									Ver Balance General
								</button>
							</div>

							<div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-600">
								<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
									Estado de Resultados
								</h3>
								<p className="text-gray-600 dark:text-gray-300 mb-4">
									Informe detallado de ingresos, gastos y beneficios.
								</p>
								<button
									type="button"
									className="px-4 py-2 bg-primary-600 border border-transparent rounded-md font-medium text-white shadow-sm hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 w-full"
								>
									Ver Estado de Resultados
								</button>
							</div>

							<div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-600">
								<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
									Libro Mayor
								</h3>
								<p className="text-gray-600 dark:text-gray-300 mb-4">
									Registro detallado de movimientos por cuenta.
								</p>
								<button
									type="button"
									className="px-4 py-2 bg-primary-600 border border-transparent rounded-md font-medium text-white shadow-sm hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 w-full"
								>
									Ver Libro Mayor
								</button>
							</div>
						</div>

						<div className="mt-8">
							<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
								Generar Informes Personalizados
							</h3>

							<div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-600">
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
									<div>
										<label
											htmlFor="reportType"
											className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
										>
											Tipo de Informe
										</label>
										<select
											id="reportType"
											className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm dark:bg-gray-600 dark:text-white"
										>
											<option value="balance">Balance General</option>
											<option value="income">Estado de Resultados</option>
											<option value="ledger">Libro Mayor</option>
											<option value="tax">Informe de Impuestos</option>
										</select>
									</div>

									<div>
										<label
											htmlFor="reportDateFrom"
											className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
										>
											Fecha desde
										</label>
										<input
											type="date"
											id="reportDateFrom"
											className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm dark:bg-gray-600 dark:text-white"
										/>
									</div>

									<div>
										<label
											htmlFor="reportDateTo"
											className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
										>
											Fecha hasta
										</label>
										<input
											type="date"
											id="reportDateTo"
											className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm dark:bg-gray-600 dark:text-white"
										/>
									</div>

									<div>
										<label
											htmlFor="reportFormat"
											className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
										>
											Formato
										</label>
										<select
											id="reportFormat"
											className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm dark:bg-gray-600 dark:text-white"
										>
											<option value="pdf">PDF</option>
											<option value="excel">Excel</option>
											<option value="csv">CSV</option>
										</select>
									</div>
								</div>

								<div className="flex justify-end">
									<button
										type="button"
										className="px-4 py-2 bg-primary-600 border border-transparent rounded-md font-medium text-white shadow-sm hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800"
									>
										Generar Informe
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default AdminAccountingPage;
