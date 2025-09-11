// src/presentation/components/checkout/PayPalForm.tsx
import React from "react";
import type {PaymentInfo} from "../../../core/services/CheckoutService";

interface PayPalFormProps {
	paymentInfo: PaymentInfo;
	errors: Record<string, string>;
	onChange: (field: keyof PaymentInfo, value: string) => void;
}

const PayPalForm: React.FC<PayPalFormProps> = ({
	paymentInfo,
	errors,
	onChange,
}) => {
	return (
		<div>
			<p className="mb-4 text-gray-600">
				Serás redirigido a PayPal para completar tu pago de forma segura.
			</p>

			<div>
				<label
					htmlFor="paypal_email"
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					Correo electrónico de PayPal *
				</label>
				<input
					type="email"
					id="paypal_email"
					value={paymentInfo.paypal_email || ""}
					onChange={(e) => onChange("paypal_email", e.target.value)}
					className={`w-full px-4 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
						errors.paypal_email ? "border-red-500" : "border-gray-300"
					}`}
					placeholder="correo@ejemplo.com"
				/>
				{errors.paypal_email && (
					<p className="mt-1 text-sm text-red-500">{errors.paypal_email}</p>
				)}
			</div>

			<div className="mt-4 text-sm text-gray-500">
				<p>
					Al continuar, serás redirigido a PayPal para completar tu compra de
					manera segura.
				</p>
			</div>
		</div>
	);
};

export default PayPalForm;
