import React from "react";
import type {Address} from "../../../core/domain/valueObjects/Address";

interface ShippingFormProps {
	shippingInfo: Address;
	errors: Record<string, string>;
	onChange: (field: keyof Address, value: string) => void;
}

const ShippingForm: React.FC<ShippingFormProps> = ({
	shippingInfo,
	errors,
	onChange,
}) => {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div className="md:col-span-2">
				<label
					htmlFor="street"
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					Dirección *
				</label>
				<input
					type="text"
					id="street"
					value={shippingInfo.street}
					onChange={(e) => onChange("street", e.target.value)}
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
					htmlFor="city"
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					Ciudad *
				</label>
				<input
					type="text"
					id="city"
					value={shippingInfo.city}
					onChange={(e) => onChange("city", e.target.value)}
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
					htmlFor="state"
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					Provincia/Estado *
				</label>
				<input
					type="text"
					id="state"
					value={shippingInfo.state}
					onChange={(e) => onChange("state", e.target.value)}
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
					htmlFor="postalCode"
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					Código Postal *
				</label>
				<input
					type="text"
					id="postalCode"
					value={shippingInfo.postalCode}
					onChange={(e) => onChange("postalCode", e.target.value)}
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
					htmlFor="country"
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					País *
				</label>
				<input
					type="text"
					id="country"
					value={shippingInfo.country}
					onChange={(e) => onChange("country", e.target.value)}
					className={`w-full px-4 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
						errors.country ? "border-red-500" : "border-gray-300"
					}`}
					placeholder="País"
				/>
				{errors.country && (
					<p className="mt-1 text-sm text-red-500">{errors.country}</p>
				)}
			</div>

			<div>
				<label
					htmlFor="phone"
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					Teléfono *
				</label>
				<input
					type="tel"
					id="phone"
					value={shippingInfo.phone}
					onChange={(e) => onChange("phone", e.target.value)}
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
	);
};

export default ShippingForm;
