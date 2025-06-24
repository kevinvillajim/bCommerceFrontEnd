import React from "react";
import type {ShoppingCart} from "../../../core/domain/entities/ShoppingCart";
import {formatCurrency} from "../../../utils/formatters/formatCurrency";

interface OrderSummaryProps {
	cart: ShoppingCart | null;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({cart}) => {
	// Si no hay carrito o está vacío
	if (!cart || cart.items.length === 0) {
		return (
			<div className="text-center py-6">
				<p className="text-gray-500">No hay productos en el carrito</p>
			</div>
		);
	}

	// ✅ CALCULAR SUBTOTAL CORRECTAMENTE CON DESCUENTOS
	const calculateSubtotal = () => {
		return cart.items.reduce((total, item) => {
			// Usar final_price si está disponible, sino usar price
			const finalPrice = item.product?.final_price ?? item.product?.price ?? item.price;
			return total + (finalPrice * item.quantity);
		}, 0);
	};

	const subtotal = calculateSubtotal();
	const taxRate = 0.15; // 15% IVA
	const shipping = subtotal > 50 ? 0 : 5.99; // Envío gratis para compras superiores a $50
	const tax = subtotal * taxRate;
	const total = subtotal + tax + shipping;

	return (
		<div>
			<h2 className="text-xl font-bold text-gray-800 mb-4">
				Resumen del pedido
			</h2>

			{/* Lista de productos */}
			<div className="space-y-3 mb-4">
				{cart.items.map((item) => {
					// ✅ MOSTRAR PRECIO CON DESCUENTO
					const finalPrice = item.product?.final_price ?? item.product?.price ?? item.price;
					const originalPrice = item.product?.price;
					const hasDiscount = originalPrice && finalPrice < originalPrice;
					
					return (
						<div
							key={item.id}
							className="flex justify-between pb-3 border-b border-gray-100"
						>
							<div className="flex items-center">
								<span className="font-medium text-gray-800 mr-2">
									{item.quantity}x
								</span>
								<div className="flex flex-col">
									<span className="text-sm line-clamp-1">
										{item.product?.name || `Producto ${item.productId}`}
									</span>
									{hasDiscount && (
										<div className="flex items-center space-x-2 text-xs">
											<span className="text-gray-400 line-through">
												{formatCurrency(originalPrice!)}
											</span>
											<span className="text-green-600 font-medium">
												{item.product?.discount_percentage}% off
											</span>
										</div>
									)}
								</div>
							</div>
							<div className="text-right">
								<div className="font-medium text-gray-800">
									{formatCurrency(finalPrice * item.quantity)}
								</div>
								{hasDiscount && (
									<div className="text-xs text-gray-400 line-through">
										{formatCurrency(originalPrice! * item.quantity)}
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>

			{/* Cálculos */}
			<div className="space-y-2 pt-2">
				<div className="flex justify-between text-gray-600">
					<span>Subtotal</span>
					<span>{formatCurrency(subtotal)}</span>
				</div>

				<div className="flex justify-between text-gray-600">
					<span>IVA (15%)</span>
					<span>{formatCurrency(tax)}</span>
				</div>

				<div className="flex justify-between text-gray-600">
					<span>Envío</span>
					<span>{shipping === 0 ? "Gratis" : formatCurrency(shipping)}</span>
				</div>

				<div className="flex justify-between pt-3 border-t border-gray-200 font-bold text-lg text-gray-800">
					<span>Total</span>
					<span>{formatCurrency(total)}</span>
				</div>
			</div>
		</div>
	);
};

export default OrderSummary;