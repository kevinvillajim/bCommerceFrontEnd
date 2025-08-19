import React from "react";
import type {ShoppingCart} from "../../../core/domain/entities/ShoppingCart";
import {formatCurrency} from "../../../utils/formatters/formatCurrency";
import {useCart} from "../../hooks/useCart";
import { useShippingConfig } from "../../contexts/ShippingConfigContext";

interface OrderSummaryProps {
	cart: ShoppingCart | null;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({cart}) => {
	// ✅ INTEGRACIÓN con códigos de descuento de feedback
	const { appliedDiscount } = useCart();
	
	// ✅ OBTENER CONFIGURACIÓN DINÁMICA DE ENVÍO
	const { freeThreshold, defaultCost, isEnabled: shippingEnabled } = useShippingConfig();
	
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

	const baseSubtotal = calculateSubtotal();
	
	// ✅ APLICAR código de descuento de feedback si existe
	const feedbackDiscountAmount = appliedDiscount ? 
		(baseSubtotal * appliedDiscount.discountCode.discount_percentage / 100) : 0;
	
	const subtotalAfterFeedbackDiscount = baseSubtotal - feedbackDiscountAmount;
	const taxRate = 0.15; // 15% IVA
	// ✅ CALCULAR ENVÍO CON CONFIGURACIÓN DINÁMICA
	const shipping = !shippingEnabled ? 0 : (subtotalAfterFeedbackDiscount >= freeThreshold ? 0 : defaultCost);
	const tax = subtotalAfterFeedbackDiscount * taxRate;
	const total = subtotalAfterFeedbackDiscount + tax + shipping;

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
					<span>{formatCurrency(baseSubtotal)}</span>
				</div>

				{/* ✅ MOSTRAR código de descuento aplicado */}
				{appliedDiscount && feedbackDiscountAmount > 0 && (
					<div className="flex justify-between text-green-600">
						<span className="text-sm">
							Código {appliedDiscount.discountCode.code} ({appliedDiscount.discountCode.discount_percentage}%):
						</span>
						<span>-{formatCurrency(feedbackDiscountAmount)}</span>
					</div>
				)}

				<div className="flex justify-between text-gray-600">
					<span>IVA (15%)</span>
					<span>{formatCurrency(tax)}</span>
				</div>

				<div className="flex justify-between text-gray-600">
					<span>Envío</span>
					<span>{shipping === 0 ? "Gratis" : formatCurrency(shipping)}</span>
				</div>

				{/* ✅ MOSTRAR total ahorrado si hay descuentos */}
				{feedbackDiscountAmount > 0 && (
					<div className="flex justify-between text-green-600 font-medium text-sm py-1 bg-green-50 px-2 rounded">
						<span>Total ahorrado:</span>
						<span>{formatCurrency(feedbackDiscountAmount)}</span>
					</div>
				)}

				<div className="flex justify-between pt-3 border-t border-gray-200 font-bold text-lg text-gray-800">
					<span>Total</span>
					<span>{formatCurrency(total)}</span>
				</div>
			</div>
		</div>
	);
};

export default OrderSummary;