// src/presentation/components/checkout/CreditCardForm.tsx
import React from "react";
import type {PaymentInfo} from "../../../core/services/CheckoutService";

interface CreditCardFormProps {
	paymentInfo: PaymentInfo;
	errors: Record<string, string>;
	onChange: (field: keyof PaymentInfo, value: string) => void;
}

const CreditCardForm: React.FC<CreditCardFormProps> = ({
	paymentInfo,
	errors,
	onChange,
}) => {
	return (
		<div className="space-y-4">
			<div>
				<label
					htmlFor="card_number"
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					Número de tarjeta *
				</label>
				<input
					type="text"
					id="card_number"
					value={paymentInfo.card_number || ""}
					onChange={(e) =>
						onChange(
							"card_number",
							e.target.value.replace(/\D/g, "").slice(0, 16)
						)
					}
					className={`w-full px-4 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
						errors.card_number ? "border-red-500" : "border-gray-300"
					}`}
					placeholder="1234 5678 9012 3456"
				/>
				{errors.card_number && (
					<p className="mt-1 text-sm text-red-500">{errors.card_number}</p>
				)}
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<label
						htmlFor="card_expiry"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Fecha de expiración *
					</label>
					<input
						type="text"
						id="card_expiry"
						value={paymentInfo.card_expiry || ""}
						onChange={(e) => {
							let value = e.target.value.replace(/[^\d/]/g, "");
							if (
								value.length === 2 &&
								!value.includes("/") &&
								paymentInfo.card_expiry?.length !== 3
							) {
								value += "/";
							}
							onChange("card_expiry", value.slice(0, 5));
						}}
						className={`w-full px-4 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
							errors.card_expiry ? "border-red-500" : "border-gray-300"
						}`}
						placeholder="MM/YY"
					/>
					{errors.card_expiry && (
						<p className="mt-1 text-sm text-red-500">{errors.card_expiry}</p>
					)}
				</div>

				<div>
					<label
						htmlFor="card_cvc"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Código de seguridad (CVC) *
					</label>
					<input
						type="text"
						id="card_cvc"
						value={paymentInfo.card_cvc || ""}
						onChange={(e) =>
							onChange(
								"card_cvc",
								e.target.value.replace(/\D/g, "").slice(0, 4)
							)
						}
						className={`w-full px-4 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
							errors.card_cvc ? "border-red-500" : "border-gray-300"
						}`}
						placeholder="123"
					/>
					{errors.card_cvc && (
						<p className="mt-1 text-sm text-red-500">{errors.card_cvc}</p>
					)}
				</div>
			</div>

			<div className="mt-2 flex items-center text-sm text-gray-500">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-5 w-5 text-gray-400 mr-2"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
					/>
				</svg>
				Tus datos están seguros y encriptados
			</div>
		</div>
	);
};

export default CreditCardForm;
