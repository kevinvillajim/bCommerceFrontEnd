import React from "react";
import {
	User,
	Store,
	Lock,
	Mail,
	Phone,
	MapPin,
	Camera,
	ChevronRight,
} from "lucide-react";


const SellerProfilePage: React.FC = () => {
	return (
		<div className="space-y-6">
			{/* Header Section */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
				<div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
					<div className="relative">
						<img
							src="https://i.pravatar.cc/150"
							alt="Seller profile"
							className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md"
						/>
						<button className="absolute bottom-0 right-0 bg-primary-600 dark:bg-primary-500 text-white rounded-full p-2 hover:bg-primary-700 transition">
							<Camera size={16} />
						</button>
					</div>

					<div className="flex-1">
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
							Nombre del Vendedor
						</h1>
						<p className="text-gray-500 dark:text-gray-400">
							seller@example.com
						</p>
						<div className="mt-4 flex space-x-4">
							<button className="flex items-center text-primary-600 dark:text-primary-400 hover:underline">
								Ver tienda <ChevronRight size={16} className="ml-1" />
							</button>
							<button className="flex items-center text-red-600 dark:text-red-400 hover:underline">
								Desactivar cuenta <ChevronRight size={16} className="ml-1" />
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Profile Sections */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Personal Information */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4">
					<h3 className="flex items-center text-lg font-medium text-gray-900 dark:text-white">
						<User
							size={20}
							className="mr-3 text-primary-600 dark:text-primary-400"
						/>
						Información Personal
					</h3>
					<div className="space-y-4">
						<div className="flex items-center">
							<Mail
								size={18}
								className="text-gray-500 dark:text-gray-400 mr-3"
							/>
							<input
								type="email"
								defaultValue="seller@example.com"
								className="w-full bg-transparent focus:outline-none text-gray-700 dark:text-gray-300"
							/>
						</div>
						<div className="flex items-center">
							<Phone
								size={18}
								className="text-gray-500 dark:text-gray-400 mr-3"
							/>
							<input
								type="tel"
								defaultValue="+123 456 789"
								className="w-full bg-transparent focus:outline-none text-gray-700 dark:text-gray-300"
							/>
						</div>
						<div className="flex items-center">
							<MapPin
								size={18}
								className="text-gray-500 dark:text-gray-400 mr-3"
							/>
							<input
								type="text"
								defaultValue="Ciudad, País"
								className="w-full bg-transparent focus:outline-none text-gray-700 dark:text-gray-300"
							/>
						</div>
					</div>
				</div>

				{/* Store Information */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4">
					<h3 className="flex items-center text-lg font-medium text-gray-900 dark:text-white">
						<Store
							size={20}
							className="mr-3 text-blue-600 dark:text-blue-400"
						/>
						Información de la Tienda
					</h3>
					<div className="space-y-4">
						<div className="flex items-center">
							<span className="text-gray-500 dark:text-gray-400 mr-3">
								Nombre de tienda
							</span>
							<input
								type="text"
								defaultValue="Mi Tienda Online"
								className="w-full bg-transparent focus:outline-none text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600 pb-1"
							/>
						</div>
						<div className="flex items-center">
							<span className="text-gray-500 dark:text-gray-400 mr-3">
								Descripción
							</span>
							<textarea
								defaultValue="Descripción de la tienda..."
								className="w-full bg-transparent focus:outline-none text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600 pb-1 resize-none"
								rows={3}
							/>
						</div>
					</div>
				</div>

				{/* Security */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4 md:col-span-2">
					<h3 className="flex items-center text-lg font-medium text-gray-900 dark:text-white">
						<Lock size={20} className="mr-3 text-red-600 dark:text-red-400" />
						Seguridad
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-2">
							<label className="text-sm text-gray-500 dark:text-gray-400">
								Contraseña actual
							</label>
							<input
								type="password"
								className="w-full bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-2 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm text-gray-500 dark:text-gray-400">
								Nueva contraseña
							</label>
							<input
								type="password"
								className="w-full bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-2 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="flex justify-end space-x-4">
				<button className="px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
					Cancelar
				</button>
				<button className="px-6 py-2 bg-primary-600 dark:bg-primary-500 rounded-lg text-white hover:bg-primary-700 dark:hover:bg-primary-600 transition">
					Guardar cambios
				</button>
			</div>
		</div>
	);
};

export default SellerProfilePage;
