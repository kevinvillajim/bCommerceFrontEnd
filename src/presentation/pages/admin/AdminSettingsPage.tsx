import React, { useState } from "react";
import {
  Save,
  Mail,
  Shield,
  CreditCard,
  Settings,
  HelpCircle,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Database,
  Globe,
  Clock,
  X,
  Upload,
  FileCheck,
} from "lucide-react";
import RatingConfiguration from "../../components/admin/RatingConfiguration";

// Componente Modal reutilizable
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
  size = "md" 
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        {/* Modal */}
        <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} w-full`}>
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                {title}
              </h3>
              <button
                type="button"
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
              >
                <span className="sr-only">Cerrar</span>
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-2">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Alerta
interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const bgColors = {
    success: "bg-green-50",
    error: "bg-red-50",
    warning: "bg-yellow-50",
    info: "bg-blue-50",
  };

  const textColors = {
    success: "text-green-800",
    error: "text-red-800",
    warning: "text-yellow-80",
    info: "text-blue-800",
  };

  const borderColors = {
    success: "border-green-400",
    error: "border-red-400",
    warning: "border-yellow-400",
    info: "border-blue-400",
  };

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertTriangle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    info: <HelpCircle className="h-5 w-5 text-blue-500" />,
  };

  return (
    <div className={`${bgColors[type]} ${borderColors[type]} border-l-4 p-4 rounded-r mb-6`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm ${textColors[type]}`}>{message}</p>
        </div>
        {onClose && (
          <button
            type="button"
            className={`ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex h-8 w-8 ${textColors[type]} hover:bg-gray-200`}
            onClick={onClose}
            aria-label="Cerrar"
          >
            <span className="sr-only">Cerrar</span>
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Página de configuración del sistema para el panel de administración
 */
const AdminSettingsPage: React.FC = () => {
	// Estado para el tab activo
	const [activeTab, setActiveTab] = useState<string>("general");

	// Estado para los formularios
	const [generalSettings, setGeneralSettings] = useState({
		siteName: "Comersia",
		siteDescription:
			"Plataforma de comercio electrónico especializada en Ecuador",
		contactEmail: "admin@comersia.app",
		adminEmail: "admin@comersia.app",
		itemsPerPage: "12",
		maintenanceMode: false,
		enableRegistration: true,
		defaultLanguage: "es",
		defaultCurrency: "USD",
		timeZone: "America/Guayaquil",
	});

	const [emailSettings, setEmailSettings] = useState({
		smtpHost: "smtp.mailserver.com",
		smtpPort: "587",
		smtpUsername: "noreply@comersia.app",
		smtpPassword: "************",
		smtpEncryption: "tls",
		senderName: "Commersia System",
		senderEmail: "noreply@comersia.app",
		notificationEmails: true,
		welcomeEmail: true,
		orderConfirmationEmail: true,
		passwordResetEmail: true,
	});

	const [securitySettings, setSecuritySettings] = useState({
		passwordMinLength: "8",
		passwordRequireSpecial: true,
		passwordRequireUppercase: true,
		passwordRequireNumbers: true,
		accountLockAttempts: "5",
		sessionTimeout: "120",
		enableTwoFactor: false,
		requireEmailVerification: true,
		adminIpRestriction: "",
		enableCaptcha: true,
	});

	const [paymentSettings, setPaymentSettings] = useState({
		currencySymbol: "$",
		currencyCode: "USD",
		enablePayPal: true,
		payPalClientId: "paypal-client-id-here",
		payPalClientSecret: "************",
		payPalSandboxMode: true,
		enableCreditCard: true,
		stripePublicKey: "pk_test_sample-key",
		stripeSecretKey: "************",
		stripeSandboxMode: true,
		enableLocalPayments: true,
		taxRate: "12",
	});

	const [integrationSettings, setIntegrationSettings] = useState({
		googleAnalyticsId: "UA-XXXXXXXXX-X",
		enableGoogleAnalytics: false,
		facebookPixelId: "",
		enableFacebookPixel: false,
		recaptchaSiteKey: "6LxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxE",
		recaptchaSecretKey: "************",
		enableHotjar: false,
		hotjarId: "",
		enableChatbot: false,
		chatbotScript: "",
	});

	const [notificationSettings, setNotificationSettings] = useState({
		adminNewOrder: true,
		adminNewUser: true,
		adminLowStock: true,
		adminNewReview: true,
		adminFailedPayment: true,
		sellerNewOrder: true,
		sellerLowStock: true,
		sellerProductReview: true,
		sellerMessageReceived: true,
		sellerReturnRequest: true,
		userOrderStatus: true,
		userDeliveryUpdates: true,
		userPromotions: false,
		userAccountChanges: true,
		userPasswordChanges: true,
	});

	const [backupSettings, setBackupSettings] = useState({
		automaticBackups: true,
		backupFrequency: "daily",
		backupTime: "02:00",
		backupRetention: "30",
		includeMedia: true,
		backupToCloud: false,
		cloudProvider: "none",
		cloudApiKey: "",
		cloudSecret: "",
		cloudBucket: "",
		lastBackupDate: "2025-04-01 02:00:00",
	});

	// Estados para modales
	const [isTestEmailModalOpen, setIsTestEmailModalOpen] = useState(false);
	const [isResetSettingsModalOpen, setIsResetSettingsModalOpen] =
		useState(false);
	const [isBackupNowModalOpen, setIsBackupNowModalOpen] = useState(false);
	const [isRestoreBackupModalOpen, setIsRestoreBackupModalOpen] =
		useState(false);

	// Estados para alertas
	const [alert, setAlert] = useState<{
		show: boolean;
		type: "success" | "error" | "warning" | "info";
		message: string;
	}>({
		show: false,
		type: "success",
		message: "",
	});

	// Estado para simular que se está subiendo un archivo
	const [restoreFile, setRestoreFile] = useState<File | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [testEmailAddress, setTestEmailAddress] = useState("");

	// Manejadores genéricos para cambios en formularios
	const handleGeneralChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const {name, value, type} = e.target;
		setGeneralSettings((prev) => ({
			...prev,
			[name]:
				type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
		}));
	};

	const handleEmailChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const {name, value, type} = e.target;
		setEmailSettings((prev) => ({
			...prev,
			[name]:
				type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
		}));
	};

	const handleSecurityChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const {name, value, type} = e.target;
		setSecuritySettings((prev) => ({
			...prev,
			[name]:
				type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
		}));
	};

	const handlePaymentChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const {name, value, type} = e.target;
		setPaymentSettings((prev) => ({
			...prev,
			[name]:
				type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
		}));
	};

	const handleIntegrationChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const {name, value, type} = e.target;
		setIntegrationSettings((prev) => ({
			...prev,
			[name]:
				type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
		}));
	};

	const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const {name, checked} = e.target;
		setNotificationSettings((prev) => ({
			...prev,
			[name]: checked,
		}));
	};

	const handleBackupChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const {name, value, type} = e.target;
		setBackupSettings((prev) => ({
			...prev,
			[name]:
				type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
		}));
	};

	// Manejador para enviar formulario
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setIsProcessing(true);

		// Simular una llamada a API
		setTimeout(() => {
			setIsProcessing(false);
			setAlert({
				show: true,
				type: "success",
				message: "Configuración guardada exitosamente",
			});

			// Ocultar la alerta después de 5 segundos
			setTimeout(() => {
				setAlert((prev) => ({...prev, show: false}));
			}, 5000);
		}, 1000);
	};

	// Manejador para probar el envío de correo
	const handleTestEmail = () => {
		if (!testEmailAddress || !testEmailAddress.includes("@")) {
			setAlert({
				show: true,
				type: "error",
				message: "Por favor ingrese una dirección de correo válida",
			});
			return;
		}

		setIsProcessing(true);

		// Simular envío de correo
		setTimeout(() => {
			setIsProcessing(false);
			setIsTestEmailModalOpen(false);
			setAlert({
				show: true,
				type: "success",
				message: `Correo de prueba enviado a ${testEmailAddress}`,
			});

			// Ocultar la alerta después de 5 segundos
			setTimeout(() => {
				setAlert((prev) => ({...prev, show: false}));
			}, 5000);
		}, 1500);
	};

	// Manejador para restaurar ajustes predeterminados
	const handleResetSettings = () => {
		setIsProcessing(true);

		// Simular reset
		setTimeout(() => {
			setIsProcessing(false);
			setIsResetSettingsModalOpen(false);

			// Reset settings to default values (in a real app, you'd get these from your backend)
			setGeneralSettings({
				siteName: "Comersia",
				siteDescription: "Plataforma de comercio electrónico",
				contactEmail: "contact@comersia.com",
				adminEmail: "admin@comersia.com",
				itemsPerPage: "12",
				maintenanceMode: false,
				enableRegistration: true,
				defaultLanguage: "es",
				defaultCurrency: "USD",
				timeZone: "America/Guayaquil",
			});

			// Reset other settings...

			setAlert({
				show: true,
				type: "success",
				message: "Configuración restablecida a valores predeterminados",
			});

			// Hide alert after 5 seconds
			setTimeout(() => {
				setAlert((prev) => ({...prev, show: false}));
			}, 5000);
		}, 1500);
	};

	// Manejador para hacer backup ahora
	const handleBackupNow = () => {
		setIsProcessing(true);

		// Simular backup
		setTimeout(() => {
			setIsProcessing(false);
			setIsBackupNowModalOpen(false);

			// Update last backup date
			setBackupSettings((prev) => ({
				...prev,
				lastBackupDate: new Date()
					.toISOString()
					.replace("T", " ")
					.substring(0, 19),
			}));

			setAlert({
				show: true,
				type: "success",
				message: "Backup creado exitosamente",
			});

			// Hide alert after 5 seconds
			setTimeout(() => {
				setAlert((prev) => ({...prev, show: false}));
			}, 5000);
		}, 2000);
	};

	// Manejador para restaurar backup
	const handleRestoreBackup = () => {
		if (!restoreFile) {
			setAlert({
				show: true,
				type: "error",
				message: "Por favor seleccione un archivo de respaldo",
			});
			return;
		}

		setIsProcessing(true);

		// Simular restauración
		setTimeout(() => {
			setIsProcessing(false);
			setIsRestoreBackupModalOpen(false);
			setRestoreFile(null);

			setAlert({
				show: true,
				type: "success",
				message:
					"Backup restaurado exitosamente. Algunas configuraciones se aplicarán después de reiniciar el sistema.",
			});

			// Hide alert after 7 seconds
			setTimeout(() => {
				setAlert((prev) => ({...prev, show: false}));
			}, 7000);
		}, 3000);
	};

	// Manejador para cambio de archivo
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setRestoreFile(e.target.files[0]);
		}
	};

	return (
		
		<div><RatingConfiguration/>
			<h1 className="text-2xl font-bold text-gray-900 mb-6">
				Configuración del Sistema
			</h1>

			{/* Alerta */}
			{alert.show && (
				<Alert
					type={alert.type}
					message={alert.message}
					onClose={() => setAlert((prev) => ({...prev, show: false}))}
				/>
			)}

			{/* Tabs de navegación */}
			<div className="mb-6">
				<div className="border-b border-gray-200">
					<nav className="-mb-px flex space-x-4 overflow-x-auto sm:space-x-8">
						<button
							onClick={() => setActiveTab("general")}
							className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
								activeTab === "general"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<Settings className="w-5 h-5 inline-block mr-1" />
							General
						</button>
						<button
							onClick={() => setActiveTab("email")}
							className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
								activeTab === "email"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<Mail className="w-5 h-5 inline-block mr-1" />
							Correo
						</button>
						<button
							onClick={() => setActiveTab("security")}
							className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
								activeTab === "security"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<Shield className="w-5 h-5 inline-block mr-1" />
							Seguridad
						</button>
						<button
							onClick={() => setActiveTab("payment")}
							className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
								activeTab === "payment"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<CreditCard className="w-5 h-5 inline-block mr-1" />
							Pagos
						</button>
						<button
							onClick={() => setActiveTab("integrations")}
							className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
								activeTab === "integrations"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<Globe className="w-5 h-5 inline-block mr-1" />
							Integraciones
						</button>
						<button
							onClick={() => setActiveTab("notifications")}
							className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
								activeTab === "notifications"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<Bell className="w-5 h-5 inline-block mr-1" />
							Notificaciones
						</button>
						<button
							onClick={() => setActiveTab("backup")}
							className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
								activeTab === "backup"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<Database className="w-5 h-5 inline-block mr-1" />
							Respaldo
						</button>
					</nav>
				</div>
			</div>

			{/* Contenido del formulario */}
			<form
				onSubmit={handleSubmit}
				className="bg-white rounded-lg shadow-sm"
			>
				{/* Sección General */}
				{activeTab === "general" && (
					<div className="p-6">
						<div className="mb-6">
							<h2 className="text-lg font-medium text-gray-900">
								Configuración General
							</h2>
							<p className="mt-1 text-sm text-gray-500">
								Configure los ajustes básicos de su tienda en línea.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label
									htmlFor="siteName"
									className="block text-sm font-medium text-gray-700"
								>
									Nombre del Sitio
								</label>
								<input
									type="text"
									id="siteName"
									name="siteName"
									value={generalSettings.siteName}
									onChange={handleGeneralChange}
									className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
									required
								/>
								<p className="mt-1 text-xs text-gray-500">
									Nombre que aparecerá en el título de la página y correos
									electrónicos.
								</p>
							</div>

							<div>
								<label
									htmlFor="defaultLanguage"
									className="block text-sm font-medium text-gray-700"
								>
									Idioma Predeterminado
								</label>
								<select
									id="defaultLanguage"
									name="defaultLanguage"
									value={generalSettings.defaultLanguage}
									onChange={handleGeneralChange}
									className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
								>
									<option value="es">Español</option>
									<option value="en">Inglés</option>
									<option value="fr">Francés</option>
									<option value="pt">Portugués</option>
								</select>
							</div>

							<div>
								<label
									htmlFor="defaultCurrency"
									className="block text-sm font-medium text-gray-700"
								>
									Moneda Predeterminada
								</label>
								<select
									id="defaultCurrency"
									name="defaultCurrency"
									value={generalSettings.defaultCurrency}
									onChange={handleGeneralChange}
									className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
								>
									<option value="USD">Dólar americano (USD)</option>
									<option value="EUR">Euro (EUR)</option>
									<option value="GBP">Libra esterlina (GBP)</option>
									<option value="COP">Peso colombiano (COP)</option>
									<option value="MXN">Peso mexicano (MXN)</option>
								</select>
							</div>

							<div>
								<label
									htmlFor="timeZone"
									className="block text-sm font-medium text-gray-700"
								>
									Zona Horaria
								</label>
								<select
									id="timeZone"
									name="timeZone"
									value={generalSettings.timeZone}
									onChange={handleGeneralChange}
									className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
								>
									<option value="America/Guayaquil">Ecuador (GMT-5)</option>
									<option value="America/Bogota">Colombia (GMT-5)</option>
									<option value="America/Lima">Perú (GMT-5)</option>
									<option value="America/Mexico_City">México (GMT-6)</option>
									<option value="America/Santiago">Chile (GMT-4)</option>
									<option value="America/Argentina/Buenos_Aires">
										Argentina (GMT-3)
									</option>
								</select>
							</div>
						</div>

						<div className="mt-6">
							<label
								htmlFor="siteDescription"
								className="block text-sm font-medium text-gray-700"
							>
								Descripción del Sitio
							</label>
							<textarea
								id="siteDescription"
								name="siteDescription"
								value={generalSettings.siteDescription}
								onChange={handleGeneralChange}
								rows={3}
								className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
							></textarea>
							<p className="mt-1 text-xs text-gray-500">
								Breve descripción para SEO y compartir en redes sociales.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
							<div>
								<label
									htmlFor="contactEmail"
									className="block text-sm font-medium text-gray-700"
								>
									Correo de Contacto
								</label>
								<input
									type="email"
									id="contactEmail"
									name="contactEmail"
									value={generalSettings.contactEmail}
									onChange={handleGeneralChange}
									className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
									required
								/>
								<p className="mt-1 text-xs text-gray-500">
									Se muestra a los clientes para soporte y contacto.
								</p>
							</div>

							<div>
								<label
									htmlFor="adminEmail"
									className="block text-sm font-medium text-gray-700"
								>
									Correo de Administración
								</label>
								<input
									type="email"
									id="adminEmail"
									name="adminEmail"
									value={generalSettings.adminEmail}
									onChange={handleGeneralChange}
									className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
									required
								/>
								<p className="mt-1 text-xs text-gray-500">
									Recibe notificaciones administrativas y alertas.
								</p>
							</div>

							<div>
								<label
									htmlFor="itemsPerPage"
									className="block text-sm font-medium text-gray-700"
								>
									Elementos por Página
								</label>
								<input
									type="number"
									id="itemsPerPage"
									name="itemsPerPage"
									value={generalSettings.itemsPerPage}
									onChange={handleGeneralChange}
									min="1"
									max="100"
									className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
								/>
								<p className="mt-1 text-xs text-gray-500">
									Número de productos a mostrar por página en las listas.
								</p>
							</div>
						</div>

						<div className="mt-6">
							<div className="flex items-start">
								<div className="flex items-center h-5">
									<input
										id="enableRegistration"
										name="enableRegistration"
										type="checkbox"
										checked={generalSettings.enableRegistration}
										onChange={handleGeneralChange}
										className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
									/>
								</div>
								<div className="ml-3 text-sm">
									<label
										htmlFor="enableRegistration"
										className="font-medium text-gray-700"
									>
										Permitir Registro de Usuarios
									</label>
									<p className="text-gray-500">
										Los usuarios pueden crear nuevas cuentas en el sitio.
									</p>
								</div>
							</div>
						</div>

						<div className="mt-4">
							<div className="flex items-start">
								<div className="flex items-center h-5">
									<input
										id="maintenanceMode"
										name="maintenanceMode"
										type="checkbox"
										checked={generalSettings.maintenanceMode}
										onChange={handleGeneralChange}
										className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
									/>
								</div>
								<div className="ml-3 text-sm">
									<label
										htmlFor="maintenanceMode"
										className="font-medium text-gray-700"
									>
										Modo Mantenimiento
									</label>
									<p className="text-gray-500">
										Cuando está activado, solo los administradores pueden
										acceder al sitio.
									</p>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Sección de Correo */}
				{activeTab === "email" && (
					<div className="p-6">
						<div className="mb-6 flex justify-between items-start">
							<div>
								<h2 className="text-lg font-medium text-gray-900">
									Configuración de Correo
								</h2>
								<p className="mt-1 text-sm text-gray-500">
									Configure los ajustes para enviar correos electrónicos desde
									su tienda.
								</p>
							</div>
							<button
								type="button"
								onClick={() => setIsTestEmailModalOpen(true)}
								className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
							>
								<Mail className="w-4 h-4 mr-2" /> Enviar correo de prueba
							</button>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label
									htmlFor="smtpHost"
									className="block text-sm font-medium text-gray-700"
								>
									Servidor SMTP
								</label>
								<input
									type="text"
									id="smtpHost"
									name="smtpHost"
									value={emailSettings.smtpHost}
									onChange={handleEmailChange}
									className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
									required
								/>
							</div>

							<div>
								<label
									htmlFor="smtpPort"
									className="block text-sm font-medium text-gray-700"
								>
									Puerto SMTP
								</label>
								<input
									type="text"
									id="smtpPort"
									name="smtpPort"
									value={emailSettings.smtpPort}
									onChange={handleEmailChange}
									className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
									required
								/>
							</div>

							<div>
								<label
									htmlFor="smtpUsername"
									className="block text-sm font-medium text-gray-700"
								>
									Usuario SMTP
								</label>
								<input
									type="text"
									id="smtpUsername"
									name="smtpUsername"
									value={emailSettings.smtpUsername}
									onChange={handleEmailChange}
									className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
									required
								/>
							</div>

							<div>
								<label
									htmlFor="smtpPassword"
									className="block text-sm font-medium text-gray-700"
								>
									Contraseña SMTP
								</label>
								<input
									type="password"
									id="smtpPassword"
									name="smtpPassword"
									value={emailSettings.smtpPassword}
									onChange={handleEmailChange}
									className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
									required
								/>
							</div>

							<div>
								<label
									htmlFor="smtpEncryption"
									className="block text-sm font-medium text-gray-700"
								>
									Cifrado SMTP
								</label>
								<select
									id="smtpEncryption"
									name="smtpEncryption"
									value={emailSettings.smtpEncryption}
									onChange={handleEmailChange}
									className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
								>
									<option value="tls">TLS</option>
									<option value="ssl">SSL</option>
									<option value="none">Ninguno</option>
								</select>
							</div>
						</div>

						<div className="border-t border-gray-200 mt-6 pt-6">
							<h3 className="text-base font-medium text-gray-900 mb-4">
								Configuración de Remitente
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label
										htmlFor="senderName"
										className="block text-sm font-medium text-gray-700"
									>
										Nombre del Remitente
									</label>
									<input
										type="text"
										id="senderName"
										name="senderName"
										value={emailSettings.senderName}
										onChange={handleEmailChange}
										className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
										required
									/>
									<p className="mt-1 text-xs text-gray-500">
										Nombre que aparecerá como remitente de correos.
									</p>
								</div>

								<div>
									<label
										htmlFor="senderEmail"
										className="block text-sm font-medium text-gray-700"
									>
										Correo del Remitente
									</label>
									<input
										type="email"
										id="senderEmail"
										name="senderEmail"
										value={emailSettings.senderEmail}
										onChange={handleEmailChange}
										className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
										required
									/>
									<p className="mt-1 text-xs text-gray-500">
										Dirección desde la que se enviarán los correos.
									</p>
								</div>
							</div>
						</div>

						<div className="border-t border-gray-200 mt-6 pt-6">
							<h3 className="text-base font-medium text-gray-900 mb-4">
								Plantillas de Correo
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="welcomeEmail"
											name="welcomeEmail"
											type="checkbox"
											checked={emailSettings.welcomeEmail}
											onChange={handleEmailChange}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
									</div>
									<div className="ml-3 text-sm">
										<label
											htmlFor="welcomeEmail"
											className="font-medium text-gray-700"
										>
											Bienvenida a Nuevos Usuarios
										</label>
									</div>
								</div>

								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="orderConfirmationEmail"
											name="orderConfirmationEmail"
											type="checkbox"
											checked={emailSettings.orderConfirmationEmail}
											onChange={handleEmailChange}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
									</div>
									<div className="ml-3 text-sm">
										<label
											htmlFor="orderConfirmationEmail"
											className="font-medium text-gray-700"
										>
											Confirmación de Pedidos
										</label>
									</div>
								</div>

								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="passwordResetEmail"
											name="passwordResetEmail"
											type="checkbox"
											checked={emailSettings.passwordResetEmail}
											onChange={handleEmailChange}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
									</div>
									<div className="ml-3 text-sm">
										<label
											htmlFor="passwordResetEmail"
											className="font-medium text-gray-700"
										>
											Restablecimiento de Contraseña
										</label>
									</div>
								</div>

								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="notificationEmails"
											name="notificationEmails"
											type="checkbox"
											checked={emailSettings.notificationEmails}
											onChange={handleEmailChange}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
									</div>
									<div className="ml-3 text-sm">
										<label
											htmlFor="notificationEmails"
											className="font-medium text-gray-700"
										>
											Notificaciones del Sistema
										</label>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Sección de Seguridad */}
				{activeTab === "security" && (
					<div className="p-6">
						<div className="mb-6">
							<h2 className="text-lg font-medium text-gray-900">
								Configuración de Seguridad
							</h2>
							<p className="mt-1 text-sm text-gray-500">
								Configure los ajustes de seguridad y protección de su tienda.
							</p>
						</div>

						<div className="border-b border-gray-200 pb-6 mb-6">
							<h3 className="text-base font-medium text-gray-900 mb-4">
								Gestión de Contraseñas
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label
										htmlFor="passwordMinLength"
										className="block text-sm font-medium text-gray-700"
									>
										Longitud Mínima de Contraseña
									</label>
									<input
										type="number"
										id="passwordMinLength"
										name="passwordMinLength"
										value={securitySettings.passwordMinLength}
										onChange={handleSecurityChange}
										min="6"
										max="20"
										className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
									/>
								</div>

								<div>
									<label
										htmlFor="accountLockAttempts"
										className="block text-sm font-medium text-gray-700"
									>
										Intentos antes de bloqueo
									</label>
									<input
										type="number"
										id="accountLockAttempts"
										name="accountLockAttempts"
										value={securitySettings.accountLockAttempts}
										onChange={handleSecurityChange}
										min="1"
										max="10"
										className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="passwordRequireUppercase"
											name="passwordRequireUppercase"
											type="checkbox"
											checked={securitySettings.passwordRequireUppercase}
											onChange={handleSecurityChange}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
									</div>
									<div className="ml-3 text-sm">
										<label
											htmlFor="passwordRequireUppercase"
											className="font-medium text-gray-700"
										>
											Requerir Mayúsculas
										</label>
									</div>
								</div>

								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="passwordRequireNumbers"
											name="passwordRequireNumbers"
											type="checkbox"
											checked={securitySettings.passwordRequireNumbers}
											onChange={handleSecurityChange}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
									</div>
									<div className="ml-3 text-sm">
										<label
											htmlFor="passwordRequireNumbers"
											className="font-medium text-gray-700"
										>
											Requerir Números
										</label>
									</div>
								</div>

								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="passwordRequireSpecial"
											name="passwordRequireSpecial"
											type="checkbox"
											checked={securitySettings.passwordRequireSpecial}
											onChange={handleSecurityChange}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
									</div>
									<div className="ml-3 text-sm">
										<label
											htmlFor="passwordRequireSpecial"
											className="font-medium text-gray-700"
										>
											Requerir Caracteres Especiales
										</label>
									</div>
								</div>
							</div>
						</div>

						<div className="border-b border-gray-200 pb-6 mb-6">
							<h3 className="text-base font-medium text-gray-900 mb-4">
								Autenticación y Sesiones
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label
										htmlFor="sessionTimeout"
										className="block text-sm font-medium text-gray-700"
									>
										Tiempo de Sesión (minutos)
									</label>
									<input
										type="number"
										id="sessionTimeout"
										name="sessionTimeout"
										value={securitySettings.sessionTimeout}
										onChange={handleSecurityChange}
										min="5"
										max="1440"
										className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
									/>
								</div>

								<div>
									<label
										htmlFor="adminIpRestriction"
										className="block text-sm font-medium text-gray-700"
									>
										Restringir acceso de administrador a IPs
									</label>
									<input
										type="text"
										id="adminIpRestriction"
										name="adminIpRestriction"
										value={securitySettings.adminIpRestriction}
										onChange={handleSecurityChange}
										placeholder="192.168.1.1, 10.0.0.1"
										className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
									/>
									<p className="mt-1 text-xs text-gray-500">
										Deje en blanco para permitir todas las IPs. Use comas para
										separar múltiples IPs.
									</p>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="enableTwoFactor"
											name="enableTwoFactor"
											type="checkbox"
											checked={securitySettings.enableTwoFactor}
											onChange={handleSecurityChange}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
									</div>
									<div className="ml-3 text-sm">
										<label
											htmlFor="enableTwoFactor"
											className="font-medium text-gray-700"
										>
											Habilitar Autenticación de Dos Factores
										</label>
										<p className="text-gray-500">
											Los usuarios podrán activar 2FA en sus cuentas.
										</p>
									</div>
								</div>

								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="requireEmailVerification"
											name="requireEmailVerification"
											type="checkbox"
											checked={securitySettings.requireEmailVerification}
											onChange={handleSecurityChange}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
									</div>
									<div className="ml-3 text-sm">
										<label
											htmlFor="requireEmailVerification"
											className="font-medium text-gray-700"
										>
											Requerir verificación de correo
										</label>
										<p className="text-gray-500">
											Los usuarios deben verificar su correo al registrarse.
										</p>
									</div>
								</div>
							</div>
						</div>

						<div>
							<h3 className="text-base font-medium text-gray-900 mb-4">
								Protección contra Spam
							</h3>

							<div className="flex items-start">
								<div className="flex items-center h-5">
									<input
										id="enableCaptcha"
										name="enableCaptcha"
										type="checkbox"
										checked={securitySettings.enableCaptcha}
										onChange={handleSecurityChange}
										className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
									/>
								</div>
								<div className="ml-3 text-sm">
									<label
										htmlFor="enableCaptcha"
										className="font-medium text-gray-700"
									>
										Habilitar CAPTCHA en formularios
									</label>
									<p className="text-gray-500">
										Protege los formularios de registro y contacto contra bots.
									</p>
								</div>
							</div>

							<div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r">
								<div className="flex">
									<div className="flex-shrink-0">
										<AlertTriangle className="h-5 w-5 text-yellow-500" />
									</div>
									<div className="ml-3">
										<h3 className="text-sm font-medium text-yellow-80">
											Aviso de seguridad
										</h3>
										<div className="mt-2 text-sm text-yellow-700">
											<p>
												Si habilita la restricción de IP para administradores,
												asegúrese de incluir su IP actual para evitar quedarse
												sin acceso al panel de administración.
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Sección de Pagos */}
				{activeTab === "payment" && (
					<div className="p-6">
						<div className="mb-6">
							<h2 className="text-lg font-medium text-gray-900">
								Configuración de Pagos
							</h2>
							<p className="mt-1 text-sm text-gray-500">
								Configure los métodos de pago y ajustes relacionados con
								transacciones.
							</p>
						</div>

						<div className="border-b border-gray-200 pb-6 mb-6">
							<h3 className="text-base font-medium text-gray-900 mb-4">
								Configuración General
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label
										htmlFor="currencySymbol"
										className="block text-sm font-medium text-gray-700"
									>
										Símbolo de Moneda
									</label>
									<input
										type="text"
										id="currencySymbol"
										name="currencySymbol"
										value={paymentSettings.currencySymbol}
										onChange={handlePaymentChange}
										className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
										maxLength={3}
										required
									/>
								</div>

								<div>
									<label
										htmlFor="currencyCode"
										className="block text-sm font-medium text-gray-700"
									>
										Código de Moneda
									</label>
									<input
										type="text"
										id="currencyCode"
										name="currencyCode"
										value={paymentSettings.currencyCode}
										onChange={handlePaymentChange}
										className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
										maxLength={3}
										required
									/>
								</div>

								<div>
									<label
										htmlFor="taxRate"
										className="block text-sm font-medium text-gray-700"
									>
										Tasa de Impuesto (%)
									</label>
									<input
										type="number"
										id="taxRate"
										name="taxRate"
										value={paymentSettings.taxRate}
										onChange={handlePaymentChange}
										min="0"
										max="100"
										step="0.01"
										className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
										required
									/>
								</div>
							</div>
						</div>

						<div className="border-b border-gray-200 pb-6 mb-6">
							<h3 className="text-base font-medium text-gray-900 mb-4">
								PayPal
							</h3>

							<div className="flex items-start mb-4">
								<div className="flex items-center h-5">
									<input
										id="enablePayPal"
										name="enablePayPal"
										type="checkbox"
										checked={paymentSettings.enablePayPal}
										onChange={handlePaymentChange}
										className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
									/>
								</div>
								<div className="ml-3 text-sm">
									<label
										htmlFor="enablePayPal"
										className="font-medium text-gray-700"
									>
										Habilitar PayPal
									</label>
								</div>
							</div>

							{paymentSettings.enablePayPal && (
								<>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<label
												htmlFor="payPalClientId"
												className="block text-sm font-medium text-gray-700"
											>
												Cliente ID de PayPal
											</label>
											<input
												type="text"
												id="payPalClientId"
												name="payPalClientId"
												value={paymentSettings.payPalClientId}
												onChange={handlePaymentChange}
												className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
												required
											/>
										</div>

										<div>
											<label
												htmlFor="payPalClientSecret"
												className="block text-sm font-medium text-gray-700"
											>
												Cliente Secret de PayPal
											</label>
											<input
												type="password"
												id="payPalClientSecret"
												name="payPalClientSecret"
												value={paymentSettings.payPalClientSecret}
												onChange={handlePaymentChange}
												className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
												required
											/>
										</div>
									</div>

									<div className="mt-4">
										<div className="flex items-start">
											<div className="flex items-center h-5">
												<input
													id="payPalSandboxMode"
													name="payPalSandboxMode"
													type="checkbox"
													checked={paymentSettings.payPalSandboxMode}
													onChange={handlePaymentChange}
													className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
												/>
											</div>
											<div className="ml-3 text-sm">
												<label
													htmlFor="payPalSandboxMode"
													className="font-medium text-gray-700"
												>
													Modo Sandbox (pruebas)
												</label>
												<p className="text-gray-500">
													Las transacciones no serán reales en este modo.
												</p>
											</div>
										</div>
									</div>
								</>
							)}
						</div>

						<div className="border-b border-gray-200 pb-6 mb-6">
							<h3 className="text-base font-medium text-gray-900 mb-4">
								Tarjeta de Crédito (Stripe)
							</h3>

							<div className="flex items-start mb-4">
								<div className="flex items-center h-5">
									<input
										id="enableCreditCard"
										name="enableCreditCard"
										type="checkbox"
										checked={paymentSettings.enableCreditCard}
										onChange={handlePaymentChange}
										className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
									/>
								</div>
								<div className="ml-3 text-sm">
									<label
										htmlFor="enableCreditCard"
										className="font-medium text-gray-700"
									>
										Habilitar Pagos con Tarjeta
									</label>
								</div>
							</div>

							{paymentSettings.enableCreditCard && (
								<>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<label
												htmlFor="stripePublicKey"
												className="block text-sm font-medium text-gray-700"
											>
												Clave Pública de Stripe
											</label>
											<input
												type="text"
												id="stripePublicKey"
												name="stripePublicKey"
												value={paymentSettings.stripePublicKey}
												onChange={handlePaymentChange}
												className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
												required
											/>
										</div>

										<div>
											<label
												htmlFor="stripeSecretKey"
												className="block text-sm font-medium text-gray-700"
											>
												Clave Secreta de Stripe
											</label>
											<input
												type="password"
												id="stripeSecretKey"
												name="stripeSecretKey"
												value={paymentSettings.stripeSecretKey}
												onChange={handlePaymentChange}
												className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
												required
											/>
										</div>
									</div>

									<div className="mt-4">
										<div className="flex items-start">
											<div className="flex items-center h-5">
												<input
													id="stripeSandboxMode"
													name="stripeSandboxMode"
													type="checkbox"
													checked={paymentSettings.stripeSandboxMode}
													onChange={handlePaymentChange}
													className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
												/>
											</div>
											<div className="ml-3 text-sm">
												<label
													htmlFor="stripeSandboxMode"
													className="font-medium text-gray-700"
												>
													Modo de Prueba
												</label>
												<p className="text-gray-500">
													Usar el entorno de pruebas de Stripe.
												</p>
											</div>
										</div>
									</div>
								</>
							)}
						</div>

						<div>
							<h3 className="text-base font-medium text-gray-900 mb-4">
								Otros Métodos de Pago
							</h3>

							<div className="flex items-start">
								<div className="flex items-center h-5">
									<input
										id="enableLocalPayments"
										name="enableLocalPayments"
										type="checkbox"
										checked={paymentSettings.enableLocalPayments}
										onChange={handlePaymentChange}
										className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
									/>
								</div>
								<div className="ml-3 text-sm">
									<label
										htmlFor="enableLocalPayments"
										className="font-medium text-gray-700"
									>
										Habilitar transferencia bancaria / pago contra entrega
									</label>
									<p className="text-gray-500">
										Permite a los clientes pagar mediante transferencia o al
										recibir los productos.
									</p>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Sección de Integraciones */}
				{activeTab === "integrations" && (
					<div className="p-6">
						<div className="mb-6">
							<h2 className="text-lg font-medium text-gray-900">
								Integraciones
							</h2>
							<p className="mt-1 text-sm text-gray-500">
								Configure integraciones con servicios de terceros.
							</p>
						</div>

						<div className="border-b border-gray-200 pb-6 mb-6">
							<h3 className="text-base font-medium text-gray-900 mb-4">
								Google Analytics
							</h3>

							<div className="flex items-start mb-4">
								<div className="flex items-center h-5">
									<input
										id="enableGoogleAnalytics"
										name="enableGoogleAnalytics"
										type="checkbox"
										checked={integrationSettings.enableGoogleAnalytics}
										onChange={handleIntegrationChange}
										className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
									/>
								</div>
								<div className="ml-3 text-sm">
									<label
										htmlFor="enableGoogleAnalytics"
										className="font-medium text-gray-700"
									>
										Habilitar Google Analytics
									</label>
								</div>
							</div>

							{integrationSettings.enableGoogleAnalytics && (
								<div>
									<label
										htmlFor="googleAnalyticsId"
										className="block text-sm font-medium text-gray-700"
									>
										ID de Medición (GA4)
									</label>
									<input
										type="text"
										id="googleAnalyticsId"
										name="googleAnalyticsId"
										value={integrationSettings.googleAnalyticsId}
										onChange={handleIntegrationChange}
										placeholder="G-XXXXXXXXXX o UA-XXXXXXXX-X"
										className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
									/>
								</div>
							)}
						</div>

						<div className="border-b border-gray-200 pb-6 mb-6">
							<h3 className="text-base font-medium text-gray-900 mb-4">
								Facebook Pixel
							</h3>

							<div className="flex items-start mb-4">
								<div className="flex items-center h-5">
									<input
										id="enableFacebookPixel"
										name="enableFacebookPixel"
										type="checkbox"
										checked={integrationSettings.enableFacebookPixel}
										onChange={handleIntegrationChange}
										className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
									/>
								</div>
								<div className="ml-3 text-sm">
									<label
										htmlFor="enableFacebookPixel"
										className="font-medium text-gray-700"
									>
										Habilitar Facebook Pixel
									</label>
								</div>
							</div>

							{integrationSettings.enableFacebookPixel && (
								<div>
									<label
										htmlFor="facebookPixelId"
										className="block text-sm font-medium text-gray-700"
									>
										ID de Facebook Pixel
									</label>
									<input
										type="text"
										id="facebookPixelId"
										name="facebookPixelId"
										value={integrationSettings.facebookPixelId}
										onChange={handleIntegrationChange}
										placeholder="XXXXXXXXXXXXXXXXXX"
										className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
									/>
								</div>
							)}
						</div>

						<div className="border-b border-gray-200 pb-6 mb-6">
							<h3 className="text-base font-medium text-gray-900 mb-4">
								Google reCAPTCHA
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label
										htmlFor="recaptchaSiteKey"
										className="block text-sm font-medium text-gray-700"
									>
										Site Key
									</label>
									<input
										type="text"
										id="recaptchaSiteKey"
										name="recaptchaSiteKey"
										value={integrationSettings.recaptchaSiteKey}
										onChange={handleIntegrationChange}
										className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
									/>
								</div>

								<div>
									<label
										htmlFor="recaptchaSecretKey"
										className="block text-sm font-medium text-gray-700"
									>
										Secret Key
									</label>
									<input
										type="password"
										id="recaptchaSecretKey"
										name="recaptchaSecretKey"
										value={integrationSettings.recaptchaSecretKey}
										onChange={handleIntegrationChange}
										className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
									/>
								</div>
							</div>
						</div>

						<div>
							<h3 className="text-base font-medium text-gray-900 mb-4">
								Otras Integraciones
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<div className="flex items-start mb-4">
										<div className="flex items-center h-5">
											<input
												id="enableHotjar"
												name="enableHotjar"
												type="checkbox"
												checked={integrationSettings.enableHotjar}
												onChange={handleIntegrationChange}
												className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
											/>
										</div>
										<div className="ml-3 text-sm">
											<label
												htmlFor="enableHotjar"
												className="font-medium text-gray-700"
											>
												Habilitar Hotjar
											</label>
										</div>
									</div>

									{integrationSettings.enableHotjar && (
										<div>
											<label
												htmlFor="hotjarId"
												className="block text-sm font-medium text-gray-700"
											>
												ID de Hotjar
											</label>
											<input
												type="text"
												id="hotjarId"
												name="hotjarId"
												value={integrationSettings.hotjarId}
												onChange={handleIntegrationChange}
												className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
											/>
										</div>
									)}
								</div>

								<div>
									<div className="flex items-start mb-4">
										<div className="flex items-center h-5">
											<input
												id="enableChatbot"
												name="enableChatbot"
												type="checkbox"
												checked={integrationSettings.enableChatbot}
												onChange={handleIntegrationChange}
												className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
											/>
										</div>
										<div className="ml-3 text-sm">
											<label
												htmlFor="enableChatbot"
												className="font-medium text-gray-700"
											>
												Habilitar Chat en vivo
											</label>
										</div>
									</div>

									{integrationSettings.enableChatbot && (
										<div>
											<label
												htmlFor="chatbotScript"
												className="block text-sm font-medium text-gray-700"
											>
												Script de Chat
											</label>
											<textarea
												id="chatbotScript"
												name="chatbotScript"
												value={integrationSettings.chatbotScript}
												onChange={handleIntegrationChange}
												rows={3}
												className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
												placeholder="Pegue aquí el script proporcionado por su proveedor de chat"
											></textarea>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Sección de Notificaciones */}
				{activeTab === "notifications" && (
					<div className="p-6">
						<div className="mb-6">
							<h2 className="text-lg font-medium text-gray-900">
								Configuración de Notificaciones
							</h2>
							<p className="mt-1 text-sm text-gray-500">
								Configure qué notificaciones se envían a administradores,
								vendedores y usuarios.
							</p>
						</div>

						<div className="border-b border-gray-200 pb-6 mb-6">
							<h3 className="text-base font-medium text-gray-900 mb-4">
								Notificaciones para Administradores
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="adminNewOrder"
											name="adminNewOrder"
											type="checkbox"
											checked={notificationSettings.adminNewOrder}
											onChange={handleNotificationChange}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
									</div>
									<div className="ml-3 text-sm">
										<label
											htmlFor="adminNewOrder"
											className="font-medium text-gray-700"
										>
											Nuevos Pedidos
										</label>
									</div>
								</div>

								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="adminNewUser"
											name="adminNewUser"
											type="checkbox"
											checked={notificationSettings.adminNewUser}
											onChange={handleNotificationChange}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
									</div>
									<div className="ml-3 text-sm">
										<label
											htmlFor="adminNewUser"
											className="font-medium text-gray-700"
										>
											Nuevos Usuarios
										</label>
									</div>
								</div>

								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="adminLowStock"
											name="adminLowStock"
											type="checkbox"
											checked={notificationSettings.adminLowStock}
											onChange={handleNotificationChange}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
									</div>
									<div className="ml-3 text-sm">
										<label
											htmlFor="adminLowStock"
											className="font-medium text-gray-700"
										>
											Stock Bajo
										</label>
									</div>
								</div>

								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="adminNewReview"
											name="adminNewReview"
											type="checkbox"
											checked={notificationSettings.adminNewReview}
											onChange={handleNotificationChange}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
									</div>
									<div className="ml-3 text-sm">
										<label
											htmlFor="adminNewReview"
											className="font-medium text-gray-700"
										>
											Nuevas Valoraciones
										</label>
									</div>
								</div>

								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="adminFailedPayment"
											name="adminFailedPayment"
											type="checkbox"
											checked={notificationSettings.adminFailedPayment}
											onChange={handleNotificationChange}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
									</div>
									<div className="ml-3 text-sm">
										<label
											htmlFor="adminFailedPayment"
											className="font-medium text-gray-700"
										>
											Pagos Fallidos
										</label>
									</div>
								</div>
							</div>
						</div>

						<div className="border-b border-gray-200 pb-6 mb-6">
							<h3 className="text-base font-medium text-gray-900 mb-4">
								Notificaciones para Vendedores
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="sellerNewOrder"
											name="sellerNewOrder"
											type="checkbox"
											checked={notificationSettings.sellerNewOrder}
											onChange={handleNotificationChange}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
									</div>
									<div className="ml-3 text-sm">
										<label
											htmlFor="sellerNewOrder"
											className="font-medium text-gray-700"
										>
											Nuevos Pedidos
										</label>
									</div>
								</div>

								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="sellerLowStock"
											name="sellerLowStock"
											type="checkbox"
											checked={notificationSettings.sellerLowStock}
											onChange={handleNotificationChange}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
									</div>
									<div className="ml-3 text-sm">
										<label
											htmlFor="sellerLowStock"
											className="font-medium text-gray-700"
										>
											Stock Bajo
										</label>
									</div>
								</div>

								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="sellerProductReview"
											name="sellerProductReview"
											type="checkbox"
											checked={notificationSettings.sellerProductReview}
											onChange={handleNotificationChange}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
									</div>
									<div className="ml-3 text-sm">
										<label
											htmlFor="sellerProductReview"
											className="font-medium text-gray-700"
										>
											Valoraciones de Productos
										</label>
									</div>
								</div>

								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="sellerMessageReceived"
											name="sellerMessageReceived"
											type="checkbox"
											checked={notificationSettings.sellerMessageReceived}
											onChange={handleNotificationChange}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
									</div>
									<div className="ml-3 text-sm">
										<label
											htmlFor="sellerMessageReceived"
											className="font-medium text-gray-700"
										>
											Mensajes Recibidos
										</label>
									</div>
								</div>

								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="sellerReturnRequest"
											name="sellerReturnRequest"
											type="checkbox"
											checked={notificationSettings.sellerReturnRequest}
											onChange={handleNotificationChange}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
									</div>
									<div className="ml-3 text-sm">
										<label
											htmlFor="sellerReturnRequest"
											className="font-medium text-gray-700"
										>
											Solicitudes de Devolución
										</label>
									</div>
								</div>
							</div>
						</div>

						<div>
							<h3 className="text-base font-medium text-gray-900 mb-4">
								Notificaciones para Usuarios
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="userOrderStatus"
											name="userOrderStatus"
											type="checkbox"
											checked={notificationSettings.userOrderStatus}
											onChange={handleNotificationChange}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
									</div>
									<div className="ml-3 text-sm">
										<label
											htmlFor="userOrderStatus"
											className="font-medium text-gray-700"
										>
											Estado de Pedidos
										</label>
									</div>
								</div>
								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="userDeliveryUpdates"
											name="userDeliveryUpdates"
											type="checkbox"
											checked={notificationSettings.userDeliveryUpdates}
											onChange={handleNotificationChange}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
									</div>
									<div className="ml-3 text-sm">
										<label
											htmlFor="userDeliveryUpdates"
											className="font-medium text-gray-700"
										>
											Actualizaciones de pedidos
										</label>
									</div>
								</div>
								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="userPromotions"
											name="userPromotions"
											type="checkbox"
											checked={notificationSettings.userPromotions}
											onChange={handleNotificationChange}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
									</div>
									<div className="ml-3 text-sm">
										<label
											htmlFor="userPromotions"
											className="font-medium text-gray-700"
										>
											Promociones y Ofertas
										</label>
									</div>
								</div>
								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="userAccountChanges"
											name="userAccountChanges"
											type="checkbox"
											checked={notificationSettings.userAccountChanges}
											onChange={handleNotificationChange}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
									</div>
									<div className="ml-3 text-sm">
										<label
											htmlFor="userAccountChanges"
											className="font-medium text-gray-700"
										>
											Cambios en la Cuenta
										</label>
									</div>
								</div>
								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="userPasswordChanges"
											name="userPasswordChanges"
											type="checkbox"
											checked={notificationSettings.userPasswordChanges}
											onChange={handleNotificationChange}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
									</div>
									<div className="ml-3 text-sm">
										<label
											htmlFor="userPasswordChanges"
											className="font-medium text-gray-700"
										>
											Cambios de Contraseña
										</label>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Sección de Respaldo */}
				{activeTab === "backup" && (
					<div className="p-6">
						<div className="mb-6 flex justify-between items-start">
							<div>
								<h2 className="text-lg font-medium text-gray-900">
									Respaldo y Restauración
								</h2>
								<p className="mt-1 text-sm text-gray-500">
									Configure respaldos automáticos y restaure su sistema desde
									copias de seguridad.
								</p>
							</div>
							<div className="flex space-x-2">
								<button
									type="button"
									onClick={() => setIsBackupNowModalOpen(true)}
									className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
								>
									<Database className="w-4 h-4 mr-2" /> Respaldar ahora
								</button>
								<button
									type="button"
									onClick={() => setIsRestoreBackupModalOpen(true)}
									className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
								>
									<RefreshCw className="w-4 h-4 mr-2" /> Restaurar
								</button>
							</div>
						</div>

						<div className="border-b border-gray-200 pb-6 mb-6">
							<h3 className="text-base font-medium text-gray-900 mb-4">
								Configuración de Respaldo Automático
							</h3>

							<div className="flex items-start mb-4">
								<div className="flex items-center h-5">
									<input
										id="automaticBackups"
										name="automaticBackups"
										type="checkbox"
										checked={backupSettings.automaticBackups}
										onChange={handleBackupChange}
										className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
									/>
								</div>
								<div className="ml-3 text-sm">
									<label
										htmlFor="automaticBackups"
										className="font-medium text-gray-700"
									>
										Habilitar respaldos automáticos
									</label>
									<p className="text-gray-500">
										El sistema realizará respaldos automáticamente según la
										programación.
									</p>
								</div>
							</div>

							{backupSettings.automaticBackups && (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
									<div>
										<label
											htmlFor="backupFrequency"
											className="block text-sm font-medium text-gray-700"
										>
											Frecuencia de Respaldo
										</label>
										<select
											id="backupFrequency"
											name="backupFrequency"
											value={backupSettings.backupFrequency}
											onChange={handleBackupChange}
											className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
										>
											<option value="hourly">Cada hora</option>
											<option value="daily">Diario</option>
											<option value="weekly">Semanal</option>
											<option value="monthly">Mensual</option>
										</select>
									</div>

									<div>
										<label
											htmlFor="backupTime"
											className="block text-sm font-medium text-gray-700"
										>
											Hora del Respaldo
										</label>
										<input
											type="time"
											id="backupTime"
											name="backupTime"
											value={backupSettings.backupTime}
											onChange={handleBackupChange}
											className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
										/>
										<p className="mt-1 text-xs text-gray-500">
											Hora del día para realizar el respaldo (zona horaria del
											servidor).
										</p>
									</div>

									<div>
										<label
											htmlFor="backupRetention"
											className="block text-sm font-medium text-gray-700"
										>
											Días de Retención
										</label>
										<input
											type="number"
											id="backupRetention"
											name="backupRetention"
											value={backupSettings.backupRetention}
											onChange={handleBackupChange}
											min="1"
											max="365"
											className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
										/>
										<p className="mt-1 text-xs text-gray-500">
											Número de días que se conservarán los respaldos antes de
											eliminarlos.
										</p>
									</div>

									<div className="flex items-start">
										<div className="flex items-center h-5">
											<input
												id="includeMedia"
												name="includeMedia"
												type="checkbox"
												checked={backupSettings.includeMedia}
												onChange={handleBackupChange}
												className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
											/>
										</div>
										<div className="ml-3 text-sm">
											<label
												htmlFor="includeMedia"
												className="font-medium text-gray-700"
											>
												Incluir archivos multimedia
											</label>
											<p className="text-gray-500">
												Incluir imágenes y otros archivos en el respaldo
												(aumenta el tamaño).
											</p>
										</div>
									</div>
								</div>
							)}
						</div>

						<div className="border-b border-gray-200 pb-6 mb-6">
							<h3 className="text-base font-medium text-gray-900 mb-4">
								Almacenamiento en la Nube
							</h3>

							<div className="flex items-start mb-4">
								<div className="flex items-center h-5">
									<input
										id="backupToCloud"
										name="backupToCloud"
										type="checkbox"
										checked={backupSettings.backupToCloud}
										onChange={handleBackupChange}
										className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
									/>
								</div>
								<div className="ml-3 text-sm">
									<label
										htmlFor="backupToCloud"
										className="font-medium text-gray-700"
									>
										Respaldar a almacenamiento en la nube
									</label>
									<p className="text-gray-500">
										Almacena las copias de seguridad en un proveedor de nube
										para mayor seguridad.
									</p>
								</div>
							</div>

							{backupSettings.backupToCloud && (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
									<div>
										<label
											htmlFor="cloudProvider"
											className="block text-sm font-medium text-gray-700"
										>
											Proveedor de Nube
										</label>
										<select
											id="cloudProvider"
											name="cloudProvider"
											value={backupSettings.cloudProvider}
											onChange={handleBackupChange}
											className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
										>
											<option value="none">Seleccione un proveedor</option>
											<option value="aws">Amazon S3</option>
											<option value="gcp">Google Cloud Storage</option>
											<option value="azure">Microsoft Azure Storage</option>
											<option value="dropbox">Dropbox</option>
										</select>
									</div>

									{backupSettings.cloudProvider !== "none" && (
										<>
											<div>
												<label
													htmlFor="cloudBucket"
													className="block text-sm font-medium text-gray-700"
												>
													Bucket / Contenedor
												</label>
												<input
													type="text"
													id="cloudBucket"
													name="cloudBucket"
													value={backupSettings.cloudBucket}
													onChange={handleBackupChange}
													className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
												/>
											</div>

											<div>
												<label
													htmlFor="cloudApiKey"
													className="block text-sm font-medium text-gray-700"
												>
													API Key / Access Key
												</label>
												<input
													type="password"
													id="cloudApiKey"
													name="cloudApiKey"
													value={backupSettings.cloudApiKey}
													onChange={handleBackupChange}
													className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
												/>
											</div>

											<div>
												<label
													htmlFor="cloudSecret"
													className="block text-sm font-medium text-gray-700"
												>
													Secret Key / Access Secret
												</label>
												<input
													type="password"
													id="cloudSecret"
													name="cloudSecret"
													value={backupSettings.cloudSecret}
													onChange={handleBackupChange}
													className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
												/>
											</div>
										</>
									)}
								</div>
							)}
						</div>

						<div>
							<h3 className="text-base font-medium text-gray-900 mb-4">
								Estado del Respaldo
							</h3>

							<div className="bg-gray-50 p-4 rounded-lg">
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium text-gray-700">
										Último respaldo:
									</span>
									<span className="text-sm text-gray-600 flex items-center">
										<Clock className="w-4 h-4 mr-1" />
										{backupSettings.lastBackupDate || "No hay respaldos"}
									</span>
								</div>

								<div className="flex items-center justify-between">
									<span className="text-sm font-medium text-gray-700">
										Próximo respaldo:
									</span>
									<span className="text-sm text-gray-600">
										{backupSettings.automaticBackups
											? backupSettings.backupFrequency === "daily"
												? `Hoy a las ${backupSettings.backupTime}`
												: backupSettings.backupFrequency === "weekly"
													? `El próximo lunes a las ${backupSettings.backupTime}`
													: backupSettings.backupFrequency === "monthly"
														? `El día 1 del próximo mes a las ${backupSettings.backupTime}`
														: `En la próxima hora programada (${backupSettings.backupTime})`
											: "No programado"}
									</span>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Botones de acción del formulario */}
				<div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
					<button
						type="button"
						onClick={() => setIsResetSettingsModalOpen(true)}
						className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
					>
						<RefreshCw className="w-4 h-4 mr-2" />
						Restaurar valores predeterminados
					</button>
					<div className="flex space-x-3">
						<button
							type="button"
							className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
						>
							Cancelar
						</button>
						<button
							type="submit"
							disabled={isProcessing}
							className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none ${isProcessing ? "opacity-70 cursor-not-allowed" : ""}`}
						>
							{isProcessing ? (
								<>
									<svg
										className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Guardando...
								</>
							) : (
								<>
									<Save className="w-4 h-4 mr-2" />
									Guardar cambios
								</>
							)}
						</button>
					</div>
				</div>
			</form>

			{/* Modal de envío de correo de prueba */}
			<Modal
				isOpen={isTestEmailModalOpen}
				onClose={() => setIsTestEmailModalOpen(false)}
				title="Enviar correo de prueba"
			>
				<div className="space-y-4">
					<p className="text-sm text-gray-500">
						Enviar un correo de prueba para verificar la configuración SMTP.
					</p>
					<div>
						<label
							htmlFor="testEmailAddress"
							className="block text-sm font-medium text-gray-700"
						>
							Dirección de correo
						</label>
						<input
							type="email"
							id="testEmailAddress"
							value={testEmailAddress}
							onChange={(e) => setTestEmailAddress(e.target.value)}
							className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
							placeholder="correo@ejemplo.com"
							required
						/>
					</div>
					<div className="pt-4 flex justify-end space-x-3 border-t border-gray-200">
						<button
							type="button"
							onClick={() => setIsTestEmailModalOpen(false)}
							className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
						>
							Cancelar
						</button>
						<button
							type="button"
							onClick={handleTestEmail}
							disabled={isProcessing}
							className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none ${isProcessing ? "opacity-70 cursor-not-allowed" : ""}`}
						>
							{isProcessing ? (
								<>
									<svg
										className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Enviando...
								</>
							) : (
								<>
									<Mail className="w-4 h-4 mr-2" />
									Enviar correo de prueba
								</>
							)}
						</button>
					</div>
				</div>
			</Modal>

			{/* Modal de confirmación para restablecer ajustes */}
			<Modal
				isOpen={isResetSettingsModalOpen}
				onClose={() => setIsResetSettingsModalOpen(false)}
				title="Restablecer configuración"
			>
				<div className="space-y-4">
					<div className="flex items-start">
						<div className="flex-shrink-0">
							<AlertTriangle className="h-6 w-6 text-yellow-500" />
						</div>
						<div className="ml-3">
							<h3 className="text-base font-medium text-gray-900">
								¿Está seguro de que desea restablecer la configuración?
							</h3>
							<p className="mt-2 text-sm text-gray-500">
								Esta acción restablecerá todos los ajustes a sus valores
								predeterminados. Esta operación no se puede deshacer.
							</p>
						</div>
					</div>
					<div className="pt-4 flex justify-end space-x-3 border-t border-gray-200">
						<button
							type="button"
							onClick={() => setIsResetSettingsModalOpen(false)}
							className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
						>
							Cancelar
						</button>
						<button
							type="button"
							onClick={handleResetSettings}
							disabled={isProcessing}
							className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none ${isProcessing ? "opacity-70 cursor-not-allowed" : ""}`}
						>
							{isProcessing ? (
								<>
									<svg
										className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Restableciendo...
								</>
							) : (
								<>
									<RefreshCw className="w-4 h-4 mr-2" />
									Sí, restablecer
								</>
							)}
						</button>
					</div>
				</div>
			</Modal>

			{/* Modal de backup ahora */}
			<Modal
				isOpen={isBackupNowModalOpen}
				onClose={() => setIsBackupNowModalOpen(false)}
				title="Crear respaldo ahora"
			>
				<div className="space-y-4">
					<p className="text-sm text-gray-500">
						Se creará una copia de seguridad completa de su sistema. Este
						proceso puede tardar varios minutos dependiendo del tamaño de su
						base de datos.
					</p>
					<div className="pt-4 flex justify-end space-x-3 border-t border-gray-200">
						<button
							type="button"
							onClick={() => setIsBackupNowModalOpen(false)}
							className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
						>
							Cancelar
						</button>
						<button
							type="button"
							onClick={handleBackupNow}
							disabled={isProcessing}
							className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none ${isProcessing ? "opacity-70 cursor-not-allowed" : ""}`}
						>
							{isProcessing ? (
								<>
									<svg
										className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Creando respaldo...
								</>
							) : (
								<>
									<Database className="w-4 h-4 mr-2" />
									Crear respaldo ahora
								</>
							)}
						</button>
					</div>
				</div>
			</Modal>

			{/* Modal de restaurar backup */}
			<Modal
				isOpen={isRestoreBackupModalOpen}
				onClose={() => setIsRestoreBackupModalOpen(false)}
				title="Restaurar desde respaldo"
			>
				<div className="space-y-4">
					<div className="flex items-start">
						<div className="flex-shrink-0">
							<AlertTriangle className="h-6 w-6 text-yellow-500" />
						</div>
						<div className="ml-3">
							<h3 className="text-base font-medium text-gray-900">
								Advertencia: Restauración de sistema
							</h3>
							<p className="mt-2 text-sm text-gray-500">
								La restauración sobrescribirá datos actuales. Asegúrese de tener
								un respaldo reciente antes de continuar.
							</p>
						</div>
					</div>

					<div className="mt-4">
						<label className="block text-sm font-medium text-gray-700">
							Archivo de respaldo
						</label>
						<div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
							<div className="space-y-1 text-center">
								<svg
									className="mx-auto h-12 w-12 text-gray-400"
									stroke="currentColor"
									fill="none"
									viewBox="0 0 48 48"
									aria-hidden="true"
								>
									<path
										d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
										strokeWidth={2}
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
								<div className="flex text-sm text-gray-600">
									<label
										htmlFor="file-upload"
										className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none"
									>
										<span>Subir archivo</span>
										<input
											id="file-upload"
											name="file-upload"
											type="file"
											className="sr-only"
											onChange={handleFileChange}
											accept=".sql,.gz,.zip"
										/>
									</label>
									<p className="pl-1">o arrastrar y soltar</p>
								</div>
								<p className="text-xs text-gray-500">
									SQL, ZIP o GZ hasta 50MB
								</p>
							</div>
						</div>
						{restoreFile && (
							<div className="mt-2 flex items-center text-sm text-primary-600">
								<FileCheck className="w-4 h-4 mr-1" />
								Archivo seleccionado: {restoreFile.name}
							</div>
						)}
					</div>

					<div className="pt-4 flex justify-end space-x-3 border-t border-gray-200">
						<button
							type="button"
							onClick={() => setIsRestoreBackupModalOpen(false)}
							className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
						>
							Cancelar
						</button>
						<button
							type="button"
							onClick={handleRestoreBackup}
							disabled={isProcessing || !restoreFile}
							className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none ${isProcessing || !restoreFile ? "opacity-70 cursor-not-allowed" : ""}`}
						>
							{isProcessing ? (
								<>
									<svg
										className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Restaurando...
								</>
							) : (
								<>
									<Upload className="w-4 h-4 mr-2" />
									Restaurar sistema
								</>
							)}
						</button>
					</div>
				</div>
			</Modal>
		</div>
	);
};

// Importación faltante de Bell
import {Bell} from "lucide-react";

export default AdminSettingsPage;