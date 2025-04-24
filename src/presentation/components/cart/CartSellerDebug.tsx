// src/presentation/components/cart/CartSellerDebug.tsx
import React, {useState, useEffect} from "react";
import {useCart} from "../../hooks/useCart";
import {SellerIdResolverService} from "../../../infrastructure/services/SellerIdResolverService";

/**
 * Componente para depurar la información del vendedor en el carrito
 * Solo usar en desarrollo, NO incluir en producción
 */
const CartSellerDebug: React.FC = () => {
	const {cart} = useCart();
	const [resolvedSellerId, setResolvedSellerId] = useState<number | undefined>(
		undefined
	);
	const [isResolving, setIsResolving] = useState(false);
	const [showAdvanced, setShowAdvanced] = useState(false);

	// Intentar extraer el seller_id de todos los productos en el carrito
	const extractSellerInfo = () => {
		if (!cart || !cart.items || cart.items.length === 0) {
			return [];
		}

		return cart.items.map((item) => {
			const product = item.product;
			if (!product)
				return {
					id: item.id,
					productId: item.productId,
					sellerId: null,
					source: "unknown",
				};

			let sellerId = null;
			let source = "unknown";

			if (product.seller_id) {
				sellerId = product.seller_id;
				source = "product.seller_id (OK)";
			} else if (product.seller && product.seller.id) {
				sellerId = product.seller.id;
				source = "product.seller.id (OK)";
			} else if (product.sellerId) {
				sellerId = product.sellerId;
				source = "product.sellerId (dudoso)";
			} else if (product.user_id) {
				sellerId = product.user_id;
				source = "product.user_id (NO usar para checkout)";
			}

			return {
				id: item.id,
				productId: item.productId,
				productName: product.name,
				sellerId,
				source,
			};
		});
	};

	const sellerInfo = extractSellerInfo();
	const uniqueSellerIds = [
		...new Set(
			sellerInfo.map((info) => info.sellerId).filter((id) => id !== null)
		),
	];
	const allSameSeller =
		uniqueSellerIds.length === 1 && uniqueSellerIds[0] !== null;
	const anySellerId = uniqueSellerIds.length > 0;

	// Resuelve el seller_id usando el servicio
	const resolveSellerIdForCart = async () => {
		if (!cart || !cart.items || cart.items.length === 0) return;

		setIsResolving(true);
		try {
			const sellerId = await SellerIdResolverService.resolveSellerIdForCart(
				cart.items
			);
			setResolvedSellerId(sellerId);
		} catch (error) {
			console.error("Error resolving seller ID:", error);
		} finally {
			setIsResolving(false);
		}
	};

	// Ejecutar al montar el componente
	useEffect(() => {
		if (cart && cart.items && cart.items.length > 0) {
			resolveSellerIdForCart();
		}
	}, [cart?.items?.length]);

	if (!cart || !cart.items || cart.items.length === 0) {
		return (
			<div className="mt-4 p-3 bg-gray-100 rounded text-sm">
				<p className="font-medium text-red-600">
					⚠️ No hay productos en el carrito
				</p>
			</div>
		);
	}

	return (
		<div className="mt-4 p-3 bg-gray-100 rounded text-sm">
			<div className="flex justify-between items-center">
				<h3 className="font-medium mb-2">Debug: Información de vendedores</h3>
				<button
					onClick={() => setShowAdvanced(!showAdvanced)}
					className="text-xs text-blue-600 hover:underline"
				>
					{showAdvanced ? "Ocultar detalles" : "Mostrar detalles"}
				</button>
			</div>

			<div className="mb-2 bg-white p-2 rounded border border-gray-300">
				<div className="flex justify-between">
					<div>
						<span className="font-medium">Estado del carrito: </span>
						{anySellerId ? (
							allSameSeller ? (
								<span className="text-green-600">✅ Mismo vendedor</span>
							) : (
								<span className="text-orange-500">⚠️ Múltiples vendedores</span>
							)
						) : (
							<span className="text-red-600">
								❌ Sin información de vendedor
							</span>
						)}
					</div>

					<div>
						<button
							onClick={resolveSellerIdForCart}
							disabled={isResolving}
							className="text-xs bg-blue-600 text-white px-2 py-1 rounded disabled:opacity-50"
						>
							{isResolving ? "Resolviendo..." : "Resolver ID"}
						</button>
					</div>
				</div>

				<div className="mt-2">
					<span className="font-medium">Seller ID para checkout: </span>
					{resolvedSellerId !== undefined ? (
						<span className="text-green-600 font-bold">{resolvedSellerId}</span>
					) : (
						<span className="text-red-600">No resuelto</span>
					)}
				</div>
			</div>

			{showAdvanced && (
				<>
					<div className="mt-2 overflow-x-auto">
						<table className="min-w-full text-xs">
							<thead className="bg-gray-200">
								<tr>
									<th className="py-1 px-2 text-left">Item ID</th>
									<th className="py-1 px-2 text-left">Producto ID</th>
									<th className="py-1 px-2 text-left">Nombre</th>
									<th className="py-1 px-2 text-left">Seller ID</th>
									<th className="py-1 px-2 text-left">Fuente</th>
									<th className="py-1 px-2 text-left">Estado</th>
								</tr>
							</thead>
							<tbody>
								{sellerInfo.map((info, index) => (
									<tr
										key={index}
										className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
									>
										<td className="py-1 px-2">{info.id}</td>
										<td className="py-1 px-2">{info.productId}</td>
										<td className="py-1 px-2">{info.productName || "N/A"}</td>
										<td className="py-1 px-2">
											{info.sellerId || "No encontrado"}
										</td>
										<td className="py-1 px-2">{info.source}</td>
										<td className="py-1 px-2">
											{info.sellerId ? (
												<span className="text-green-600">✅</span>
											) : (
												<span className="text-red-600">❌</span>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div className="mt-3 bg-yellow-50 p-2 rounded border border-yellow-200 text-xs text-yellow-800">
						<p className="font-medium">Solución: </p>
						<p>
							El sistema usará un seller_id predeterminado (1) cuando no
							encuentra información de vendedor en los productos.
						</p>
					</div>
				</>
			)}

			<div className="mt-3 text-xs text-gray-500">
				<p>
					* Este componente es solo para depuración y no debe incluirse en
					producción.
				</p>
			</div>
		</div>
	);
};

export default CartSellerDebug;
