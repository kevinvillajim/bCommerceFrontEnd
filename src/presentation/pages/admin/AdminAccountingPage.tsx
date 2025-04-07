import React, {useState, useEffect} from "react";
import {
	DollarSign,
	Filter,
	BarChart2,
	X,
	Plus,
	Save,
	Archive,
	Eye,
} from "lucide-react";
import Table from "../../components/dashboard/Table";
import type {
	AccountingTransaction,
	AccountingAccount,
	AccountingEntryCreationData,
} from "../../../core/domain/entities/Accounting";
import DashboardCardList from "../../components/dashboard/DashboardCardList";


// Componente Modal
interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
	size?: "sm" | "md" | "lg" | "xl";
}

const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	title,
	children,
	size = "md",
}) => {
	if (!isOpen) return null;

	const sizeClasses = {
		sm: "max-w-md",
		md: "max-w-2xl",
		lg: "max-w-4xl",
		xl: "max-w-6xl",
	};

	return (
		<div
			className="fixed inset-0 z-50 overflow-y-auto"
			aria-labelledby="modal-title"
			role="dialog"
			aria-modal="true"
		>
			<div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
				{/* Overlay */}
				<div
					className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
					aria-hidden="true"
					onClick={onClose}
				></div>

				{/* Modal */}
				<div
					className={`inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} w-full`}
				>
					<div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
						<div className="flex justify-between items-center mb-4">
							<h3
								className="text-lg leading-6 font-medium text-gray-900 dark:text-white"
								id="modal-title"
							>
								{title}
							</h3>
							<button
								type="button"
								className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
								onClick={onClose}
							>
								<span className="sr-only">Cerrar</span>
								<X className="h-6 w-6" />
							</button>
						</div>
						<div className="mt-2">{children}</div>
					</div>
				</div>
			</div>
		</div>
	);
};

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

	// Estados para modales
	const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] =
		useState<boolean>(false);
	const [isNewAccountModalOpen, setIsNewAccountModalOpen] =
		useState<boolean>(false);
	const [isTransactionDetailModalOpen, setIsTransactionDetailModalOpen] =
		useState<boolean>(false);
	const [isAccountDetailModalOpen, setIsAccountDetailModalOpen] =
		useState<boolean>(false);
	const [selectedTransaction, setSelectedTransaction] =
		useState<AccountingTransaction | null>(null);
	const [selectedAccount, setSelectedAccount] =
		useState<AccountingAccount | null>(null);

	// Estados para formulario de nueva transacción
	const [newTransaction, setNewTransaction] = useState<{
		referenceNumber: string;
		transactionDate: string;
		description: string;
		type: string;
		entries: AccountingEntryCreationData[];
	}>({
		referenceNumber: "",
		transactionDate: new Date().toISOString().split("T")[0],
		description: "",
		type: "Venta",
		entries: [
			{accountId: 0, debitAmount: 0, creditAmount: 0, notes: ""},
			{accountId: 0, debitAmount: 0, creditAmount: 0, notes: ""},
		],
	});

	// Estados para formulario de nueva cuenta
	const [newAccount, setNewAccount] = useState<{
		code: string;
		name: string;
		type: string;
		description: string;
		isActive: boolean;
	}>({
		code: "",
		name: "",
		type: "Activo",
		description: "",
		isActive: true,
	});

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

	// Función para abrir el modal de detalle de transacción
	const openTransactionDetail = (transaction: AccountingTransaction) => {
		setSelectedTransaction(transaction);
		setIsTransactionDetailModalOpen(true);
	};

	// Función para abrir el modal de detalle de cuenta
	const openAccountDetail = (account: AccountingAccount) => {
		setSelectedAccount(account);
		setIsAccountDetailModalOpen(true);
	};

	// Función para manejar cambios en el formulario de nueva transacción
	const handleTransactionChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const {name, value} = e.target;
		setNewTransaction({
			...newTransaction,
			[name]: value,
		});
	};

	// Función para manejar cambios en las entradas de la transacción
	const handleEntryChange = (
		index: number,
		field: keyof AccountingEntryCreationData,
		value: any
	) => {
		const updatedEntries = [...newTransaction.entries];
		updatedEntries[index] = {
			...updatedEntries[index],
			[field]: field === "accountId" ? Number(value) : parseFloat(value) || 0,
		};
		setNewTransaction({
			...newTransaction,
			entries: updatedEntries,
		});
	};

	// Función para añadir una nueva entrada a la transacción
	const addTransactionEntry = () => {
		setNewTransaction({
			...newTransaction,
			entries: [
				...newTransaction.entries,
				{accountId: 0, debitAmount: 0, creditAmount: 0, notes: ""},
			],
		});
	};

	// Función para eliminar una entrada de la transacción
	const removeTransactionEntry = (index: number) => {
		if (newTransaction.entries.length <= 2) {
			alert("Una transacción debe tener al menos dos entradas");
			return;
		}

		const updatedEntries = newTransaction.entries.filter((_, i) => i !== index);
		setNewTransaction({
			...newTransaction,
			entries: updatedEntries,
		});
	};

	// Función para manejar cambios en el formulario de nueva cuenta
	const handleAccountChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const {name, value, type} = e.target;
		const updatedValue =
			type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

		setNewAccount({
			...newAccount,
			[name]: updatedValue,
		});
	};

	// Función para guardar la nueva transacción
	const saveTransaction = () => {
		// Aquí iría la lógica para guardar en la API
		console.log("Guardando transacción:", newTransaction);

		// Validar sumas de debe y haber
		const totalDebit = newTransaction.entries.reduce(
			(sum, entry) => sum + entry.debitAmount,
			0
		);
		const totalCredit = newTransaction.entries.reduce(
			(sum, entry) => sum + entry.creditAmount,
			0
		);

		if (totalDebit !== totalCredit) {
			alert(
				`Los totales de débito (${totalDebit}) y crédito (${totalCredit}) deben ser iguales`
			);
			return;
		}

		// Cerrar modal y reiniciar formulario
		setIsNewTransactionModalOpen(false);
		setNewTransaction({
			referenceNumber: "",
			transactionDate: new Date().toISOString().split("T")[0],
			description: "",
			type: "Venta",
			entries: [
				{accountId: 0, debitAmount: 0, creditAmount: 0, notes: ""},
				{accountId: 0, debitAmount: 0, creditAmount: 0, notes: ""},
			],
		});
	};

	// Función para guardar la nueva cuenta
	const saveAccount = () => {
		// Aquí iría la lógica para guardar en la API
		console.log("Guardando cuenta:", newAccount);

		// Cerrar modal y reiniciar formulario
		setIsNewAccountModalOpen(false);
		setNewAccount({
			code: "",
			name: "",
			type: "Activo",
			description: "",
			isActive: true,
		});
	};

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
					<button
						onClick={() => openTransactionDetail(transaction)}
						className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-200"
						title="Ver detalles"
					>
						<Eye size={16} />
					</button>
					{!transaction.isPosted && (
						<button
							className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200"
							title="Contabilizar"
						>
							<Archive size={16} />
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
						{formatCurrency(balance)}
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
					<button
						onClick={() => openAccountDetail(account)}
						className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-200"
						title="Ver detalles"
					>
						<Eye size={16} />
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

	// Calcular totales para la transacción actual
	const calculateTotals = () => {
		const totalDebit = newTransaction.entries.reduce(
			(sum, entry) => sum + entry.debitAmount,
			0
		);
		const totalCredit = newTransaction.entries.reduce(
			(sum, entry) => sum + entry.creditAmount,
			0
		);

		return {
			totalDebit,
			totalCredit,
			difference: totalDebit - totalCredit,
		};
	};

	const totals = calculateTotals();

	const cards = [
		{
		  title: "Ingresos Totales",
		  value: formatCurrency(financialSummary.income),
		  change: 0,
		  icon: DollarSign,
		  iconBgColor: "bg-green-50 dark:bg-green-900",
		  iconColor: "text-green-600 dark:text-green-400",
		},
		{
		  title: "Gastos Totales",
		  value: formatCurrency(financialSummary.expenses),
		  change: 0,
		  icon: DollarSign,
		  iconBgColor: "bg-red-50 dark:bg-red-900",
		  iconColor: "text-red-600 dark:text-red-400",
		},
		{
		  title: "Balance",
		  value: formatCurrency(financialSummary.balance),
		  change: 0,
		  icon: BarChart2,
		  iconBgColor: "bg-blue-50 dark:bg-blue-900",
		  iconColor: "text-blue-600 dark:text-blue-400",
		},
		{
		  title: "Beneficio Neto",
		  value: formatCurrency(financialSummary.netProfit),
		  change: financialSummary.netProfitPercentage,
		  icon: DollarSign,
		  iconBgColor: "bg-purple-50 dark:bg-purple-900",
		  iconColor: "text-purple-600 dark:text-purple-400",
		},
	  ];

	return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Gestión Contable
      </h1>
      <div className="mb-5">
        {/* Tarjetas de resumen */}
        <DashboardCardList cards={cards} />
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
                    setDateRange({ ...dateRange, from: e.target.value })
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
                    setDateRange({ ...dateRange, to: e.target.value })
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
                onClick={() => setIsNewTransactionModalOpen(true)}
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
                onClick={() => setIsNewAccountModalOpen(true)}
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

      {/* Modal de Nueva Transacción */}
      <Modal
        isOpen={isNewTransactionModalOpen}
        onClose={() => setIsNewTransactionModalOpen(false)}
        title="Nueva Transacción Contable"
        size="lg"
      >
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="referenceNumber"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Número de Referencia
              </label>
              <input
                type="text"
                id="referenceNumber"
                name="referenceNumber"
                value={newTransaction.referenceNumber}
                onChange={handleTransactionChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="TRANS-XXX"
                required
              />
            </div>
            <div>
              <label
                htmlFor="transactionDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Fecha de Transacción
              </label>
              <input
                type="date"
                id="transactionDate"
                name="transactionDate"
                value={newTransaction.transactionDate}
                onChange={handleTransactionChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Tipo de Transacción
              </label>
              <select
                id="type"
                name="type"
                value={newTransaction.type}
                onChange={handleTransactionChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="Venta">Venta</option>
                <option value="Compra">Compra</option>
                <option value="Gasto">Gasto</option>
                <option value="Devolución">Devolución</option>
                <option value="Ajuste">Ajuste</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Descripción
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={newTransaction.description}
                onChange={handleTransactionChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Descripción de la transacción"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Entradas Contables
              </label>
              <button
                type="button"
                onClick={addTransactionEntry}
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center text-sm font-medium"
              >
                <Plus
                  size={16}
                  className="mr-1"
                />{" "}
                Añadir entrada
              </button>
            </div>

            <div className="overflow-x-auto border border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Cuenta
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Debe
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Haber
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Notas
                    </th>
                    <th className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {newTransaction.entries.map((entry, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <select
                          value={entry.accountId}
                          onChange={(e) =>
                            handleEntryChange(
                              index,
                              "accountId",
                              e.target.value
                            )
                          }
                          className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                          required
                        >
                          <option value="">Seleccionar cuenta</option>
                          {accounts.map((account) => (
                            <option
                              key={account.id}
                              value={account.id}
                            >
                              {account.code} - {account.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <input
                          type="number"
                          value={entry.debitAmount}
                          onChange={(e) =>
                            handleEntryChange(
                              index,
                              "debitAmount",
                              e.target.value
                            )
                          }
                          step="0.01"
                          min="0"
                          className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <input
                          type="number"
                          value={entry.creditAmount}
                          onChange={(e) =>
                            handleEntryChange(
                              index,
                              "creditAmount",
                              e.target.value
                            )
                          }
                          step="0.01"
                          min="0"
                          className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <input
                          type="text"
                          value={entry.notes || ""}
                          onChange={(e) =>
                            handleEntryChange(index, "notes", e.target.value)
                          }
                          className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Notas"
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-center">
                        <button
                          type="button"
                          onClick={() => removeTransactionEntry(index)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      Totales
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(totals.totalDebit)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(totals.totalCredit)}
                    </td>
                    <td
                      colSpan={2}
                      className="px-3 py-2 whitespace-nowrap text-sm font-medium"
                    >
                      <span
                        className={`${totals.difference === 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                      >
                        {totals.difference === 0
                          ? "Transacción balanceada"
                          : `Diferencia: ${formatCurrency(Math.abs(totals.difference))}`}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsNewTransactionModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={saveTransaction}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
            >
              <Save
                size={16}
                className="mr-2"
              />{" "}
              Guardar Transacción
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Nueva Cuenta */}
      <Modal
        isOpen={isNewAccountModalOpen}
        onClose={() => setIsNewAccountModalOpen(false)}
        title="Nueva Cuenta Contable"
      >
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Código de Cuenta
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={newAccount.code}
                onChange={handleAccountChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ej. 1000"
                required
              />
            </div>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Nombre de Cuenta
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={newAccount.name}
                onChange={handleAccountChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ej. Efectivo"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="accountType"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Tipo de Cuenta
              </label>
              <select
                id="accountType"
                name="type"
                value={newAccount.type}
                onChange={handleAccountChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="Activo">Activo</option>
                <option value="Pasivo">Pasivo</option>
                <option value="Patrimonio">Patrimonio</option>
                <option value="Ingreso">Ingreso</option>
                <option value="Gasto">Gasto</option>
                <option value="Costo">Costo</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="isActive"
                className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mt-6"
              >
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={newAccount.isActive}
                  onChange={handleAccountChange}
                  className="h-4 w-4 text-primary-600 dark:text-primary-500 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="ml-2">Cuenta Activa</span>
              </label>
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={newAccount.description}
              onChange={handleAccountChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Descripción detallada de la cuenta"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsNewAccountModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={saveAccount}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
            >
              <Save
                size={16}
                className="mr-2"
              />{" "}
              Guardar Cuenta
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Detalle de Transacción */}
      <Modal
        isOpen={isTransactionDetailModalOpen}
        onClose={() => setIsTransactionDetailModalOpen(false)}
        title={`Detalles de Transacción: ${selectedTransaction?.referenceNumber}`}
        size="lg"
      >
        {selectedTransaction && (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Referencia
                  </h4>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                    {selectedTransaction.referenceNumber}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Fecha
                  </h4>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {new Date(
                      selectedTransaction.transactionDate
                    ).toLocaleDateString("es-ES")}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Tipo
                  </h4>
                  <p className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${
                        selectedTransaction.type === "Venta"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : selectedTransaction.type === "Compra"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            : selectedTransaction.type === "Gasto"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                      }`}
                    >
                      {selectedTransaction.type}
                    </span>
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Descripción
                </h4>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {selectedTransaction.description}
                </p>
              </div>
              <div className="mt-4">
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Estado
                </h4>
                <p className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${selectedTransaction.isPosted ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"}`}
                  >
                    {selectedTransaction.isPosted
                      ? "Contabilizado"
                      : "Pendiente"}
                  </span>
                </p>
              </div>
              {selectedTransaction.orderId && (
                <div className="mt-4">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Orden relacionada
                  </h4>
                  <p className="mt-1 text-sm text-primary-600 dark:text-primary-400 font-medium">
                    #{selectedTransaction.orderId}
                  </p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">
                Entradas Contables
              </h3>
              <div className="overflow-x-auto border border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Cuenta
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Debe
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Haber
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Notas
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {selectedTransaction.entries.map((entry) => {
                      // Encontrar la cuenta correspondiente
                      const account = accounts.find(
                        (a) => a.id === entry.accountId
                      );

                      return (
                        <tr key={entry.id}>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {account
                              ? `${account.code} - ${account.name}`
                              : `Cuenta ID: ${entry.accountId}`}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                            {entry.debitAmount > 0
                              ? formatCurrency(entry.debitAmount)
                              : ""}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                            {entry.creditAmount > 0
                              ? formatCurrency(entry.creditAmount)
                              : ""}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            {entry.notes}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Fila de totales */}
                    <tr className="bg-gray-50 dark:bg-gray-700 font-medium">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        Totales
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                        {formatCurrency(
                          selectedTransaction.entries.reduce(
                            (sum, entry) => sum + entry.debitAmount,
                            0
                          )
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                        {formatCurrency(
                          selectedTransaction.entries.reduce(
                            (sum, entry) => sum + entry.creditAmount,
                            0
                          )
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {selectedTransaction.isBalanced ? (
                          <span className="text-green-600 dark:text-green-400">
                            Transacción balanceada
                          </span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400">
                            Transacción no balanceada
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              {!selectedTransaction.isPosted && (
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
                >
                  <Archive
                    size={16}
                    className="mr-2"
                  />{" "}
                  Contabilizar
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsTransactionDetailModalOpen(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Detalle de Cuenta */}
      <Modal
        isOpen={isAccountDetailModalOpen}
        onClose={() => setIsAccountDetailModalOpen(false)}
        title={`Detalles de Cuenta: ${selectedAccount?.code} - ${selectedAccount?.name}`}
      >
        {selectedAccount && (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Código
                  </h4>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                    {selectedAccount.code}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Nombre
                  </h4>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedAccount.name}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Tipo
                  </h4>
                  <p className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${
                        selectedAccount.type === "Activo"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          : selectedAccount.type === "Pasivo"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            : selectedAccount.type === "Ingreso"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : selectedAccount.type === "Gasto"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                : selectedAccount.type === "Costo"
                                  ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                      }`}
                    >
                      {selectedAccount.type}
                    </span>
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Saldo
                  </h4>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    <span
                      className={`font-medium ${selectedAccount.balance && selectedAccount.balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                    >
                      {formatCurrency(selectedAccount.balance || 0)}
                    </span>
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Estado
                </h4>
                <p className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${selectedAccount.isActive ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"}`}
                  >
                    {selectedAccount.isActive ? "Activa" : "Inactiva"}
                  </span>
                </p>
              </div>
              <div className="mt-4">
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Descripción
                </h4>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {selectedAccount.description || "Sin descripción"}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">
                Movimientos Recientes
              </h3>
              <div className="border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-4 text-center text-gray-500 dark:text-gray-400">
                <p>
                  Para ver los movimientos detallados de esta cuenta, genere un
                  informe de Libro Mayor.
                </p>
                <button
                  type="button"
                  className="mt-3 px-4 py-2 bg-primary-600 border border-transparent rounded-md font-medium text-white shadow-sm hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800"
                >
                  Ver Libro Mayor
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                onClick={() => setIsAccountDetailModalOpen(false)}
              >
                Cerrar
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
              >
                Editar Cuenta
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminAccountingPage;
