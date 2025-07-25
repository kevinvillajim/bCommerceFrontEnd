import React from "react";
import type {Address} from "../../../core/domain/valueObjects/Address";

interface AddressFormProps {
	title: string;
	address: Partial<Address>;
	onAddressChange: (field: keyof Address, value: string) => void;
	errors: Record<string, string>;
}

const AddressForm: React.FC<AddressFormProps> = ({
	title,
	address,
	onAddressChange,
	errors,
}) => {
	const formId = title.replace(/\s+/g, "-").toLowerCase();

	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold text-gray-800">
				{title}
			</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="md:col-span-2">
					<label
						htmlFor={`name-${formId}`}
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Nombre Completo *
					</label>
					<input
						type="text"
						id={`name-${formId}`}
						value={address.name || ""}
						onChange={(e) => onAddressChange("name", e.target.value)}
						className={`w-full px-4 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
							errors.name ? "border-red-500" : "border-gray-300"
						}`}
						placeholder="Nombre y Apellido"
					/>
					{errors.name && (
						<p className="mt-1 text-sm text-red-500">{errors.name}</p>
					)}
				</div>

				<div className="md:col-span-2">
					<label
						htmlFor={`street-${formId}`}
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Dirección / Calle Principal *
					</label>
					<input
						type="text"
						id={`street-${formId}`}
						value={address.street || ""}
						onChange={(e) => onAddressChange("street", e.target.value)}
						className={`w-full px-4 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
							errors.street ? "border-red-500" : "border-gray-300"
						}`}
						placeholder="Calle, número, piso, etc."
					/>
					{errors.street && (
						<p className="mt-1 text-sm text-red-500">{errors.street}</p>
					)}
				</div>

				<div>
					<label
						htmlFor={`city-${formId}`}
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Ciudad *
					</label>
					<input
						type="text"
						id={`city-${formId}`}
						value={address.city || ""}
						onChange={(e) => onAddressChange("city", e.target.value)}
						className={`w-full px-4 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
							errors.city ? "border-red-500" : "border-gray-300"
						}`}
						placeholder="Ciudad"
					/>
					{errors.city && (
						<p className="mt-1 text-sm text-red-500">{errors.city}</p>
					)}
				</div>

				<div>
					<label
						htmlFor={`state-${formId}`}
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Provincia/Estado *
					</label>
					<input
						type="text"
						id={`state-${formId}`}
						value={address.state || ""}
						onChange={(e) => onAddressChange("state", e.target.value)}
						className={`w-full px-4 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
							errors.state ? "border-red-500" : "border-gray-300"
						}`}
						placeholder="Provincia o Estado"
					/>
					{errors.state && (
						<p className="mt-1 text-sm text-red-500">{errors.state}</p>
					)}
				</div>

				<div>
					<label
						htmlFor={`postalCode-${formId}`}
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Código Postal *
					</label>
					<input
						type="text"
						id={`postalCode-${formId}`}
						value={address.postalCode || ""}
						onChange={(e) => onAddressChange("postalCode", e.target.value)}
						className={`w-full px-4 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
							errors.postalCode ? "border-red-500" : "border-gray-300"
						}`}
						placeholder="Código Postal"
					/>
					{errors.postalCode && (
						<p className="mt-1 text-sm text-red-500">{errors.postalCode}</p>
					)}
				</div>

				<div>
					<label
						htmlFor={`country-${formId}`}
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						País *
					</label>
					<input
						type="text"
						id={`country-${formId}`}
						value={address.country || ""}
						onChange={(e) => onAddressChange("country", e.target.value)}
						className={`w-full px-4 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
							errors.country ? "border-red-500" : "border-gray-300"
						}`}
						placeholder="País"
					/>
					{errors.country && (
						<p className="mt-1 text-sm text-red-500">{errors.country}</p>
					)}
				</div>

				<div className="md:col-span-2">
					<label
						htmlFor={`phone-${formId}`}
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Teléfono *
					</label>
					<input
						type="tel"
						id={`phone-${formId}`}
						value={address.phone || ""}
						onChange={(e) => onAddressChange("phone", e.target.value)}
						className={`w-full px-4 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
							errors.phone ? "border-red-500" : "border-gray-300"
						}`}
						placeholder="Número de teléfono"
					/>
					{errors.phone && (
						<p className="mt-1 text-sm text-red-500">{errors.phone}</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default AddressForm;
