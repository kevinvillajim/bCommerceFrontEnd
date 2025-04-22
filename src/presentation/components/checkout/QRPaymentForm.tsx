// src/presentation/components/checkout/QRPaymentForm.tsx
import React, {useState} from "react";
import {useCart} from "../../hooks/useCart";
import {formatCurrency} from "../../../utils/formatters/formatCurrency";

const QRPaymentForm: React.FC = () => {
	const [qrRevealed, setQrRevealed] = useState(false);
	const {cart} = useCart();

	// Calcular el total para mostrar en el QR
	const total = cart?.total || 0;

	return (
		<div className="text-center">
			<p className="mb-4 text-gray-600">
				Escanea el código QR con tu aplicación de pago móvil para completar la
				compra.
			</p>

			{qrRevealed ? (
				<div className="mb-4 mx-auto">
					<div className="bg-gray-100 p-4 rounded-lg inline-block">
						{/* QR code placeholder */}
						<div className="w-64 h-64 mx-auto bg-white p-4 relative">
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="border-2 border-gray-300 p-4 rounded-lg">
									<svg viewBox="0 0 100 100" className="w-full h-full">
										<rect
											x="10"
											y="10"
											width="80"
											height="80"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										/>
										<rect
											x="25"
											y="25"
											width="50"
											height="50"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										/>
										<rect
											x="40"
											y="40"
											width="20"
											height="20"
											fill="currentColor"
										/>
										<rect
											x="20"
											y="60"
											width="10"
											height="10"
											fill="currentColor"
										/>
										<rect
											x="70"
											y="20"
											width="10"
											height="10"
											fill="currentColor"
										/>
										<rect
											x="20"
											y="20"
											width="10"
											height="10"
											fill="currentColor"
										/>
										<rect
											x="70"
											y="70"
											width="10"
											height="10"
											fill="currentColor"
										/>
									</svg>
								</div>
							</div>
						</div>
					</div>
					<p className="text-sm text-gray-600 mt-2">
						Monto a pagar: {formatCurrency(total)}
					</p>
				</div>
			) : (
				<button
					type="button"
					onClick={() => setQrRevealed(true)}
					className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
				>
					Generar código QR
				</button>
			)}

			<div className="mt-4 text-sm text-gray-500">
				<p>1. Escanea el código QR con tu aplicación de pago.</p>
				<p>2. Confirma el pago en tu dispositivo.</p>
				<p>3. Una vez completado, haz clic en "Finalizar compra".</p>
			</div>
		</div>
	);
};

export default QRPaymentForm;
