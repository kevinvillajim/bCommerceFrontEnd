import React from "react";
import {Heart, ShoppingCart} from "lucide-react";
import { Link } from "react-router-dom";
import RatingStars from "../common/RatingStars";

interface ProductCardProps {
	id: number;
	name: string;
	price: number;
	discount?: number;
	rating?: number;
	reviews?: number;
	image: string;
	category?: string;
	isNew?: boolean;
	color?: boolean;
	onAddToCart?: (id: number) => void;
	onAddToWishlist?: (id: number) => void;
}

const ProductCardCompact: React.FC<ProductCardProps> = ({
	id,
	name,
	price,
	discount,
	rating,
	reviews,
	image,
	category,
	isNew = false,
	color = true,
	onAddToCart = () => {},
	onAddToWishlist = () => {},
}) => {
	// Calculate discounted price
	const discountedPrice = discount ? price - price * (discount / 100) : price;

	return (
		<div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group product-card">
			{/* Product Image with Overlay */}
			<div className="relative h-48 overflow-hidden">
				<img
					src={image}
					alt={name}
					className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
				/>

				{/* Discount Tag */}
				{discount && (
					<div
						className={`absolute top-2 left-2 ${color ? "bg-red-500" : "bg-primary-600"} text-white text-xs font-bold py-1 px-2 rounded badge`}
					>
						-{discount}%
					</div>
				)}

				{/* New Product Tag */}
				{isNew && (
					<div
						className={`absolute top-2 right-2 ${color ? "bg-green-500" : "bg-primary-800"} text-white text-xs font-bold py-1 px-2 rounded badge`}
					>
						Nuevo
					</div>
				)}

				{/* Quick Action Buttons */}
				<div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center gap-2 hidden md:flex">
					<button
						onClick={() => onAddToWishlist(id)}
						className="bg-white p-2 rounded-full hover:bg-primary-50 hover:text-primary-600 transition-colors"
						aria-label="Add to wishlist"
					>
						<Heart size={18} />
					</button>
					<button
						onClick={() => onAddToCart(id)}
						className="bg-white p-2 rounded-full hover:bg-primary-50 hover:text-primary-600 transition-colors"
						aria-label="Add to cart"
					>
						<ShoppingCart size={18} />
					</button>
				</div>
			</div>

			{/* Product Info */}
			<div className="p-3">
				{/* Category */}
				{category && (
					<span className="text-xs text-gray-500 uppercase mb-1 block">
						{category}
					</span>
				)}

				{/* Product Name */}
				<Link to={`/products/${id}`}>
					<h3 className="font-medium text-gray-800 mb-1 line-clamp-1 hover:text-primary-600 transition-colors">
						{name}
					</h3>
				</Link>

				{/* Rating */}
					<div className="mb-2">
						<RatingStars
							rating={rating}
							size={14}
							showValue={true}
							reviews={reviews}
						/>
					</div>

				{/* Price */}
				<div className="flex items-center justify-between">
					<div className="flex items-center">
						{discount ? (
							<>
								<span className="font-bold text-primary-600">
									${discountedPrice.toFixed(2)}
								</span>
								<span className="text-sm text-gray-500 line-through ml-2">
									${price.toFixed(2)}
								</span>
							</>
						) : (
							<span className="font-bold text-primary-600 product-price">
								${price.toFixed(2)}
							</span>
						)}
					</div>

					{/* Añadir: Botones de acción rápida para móvil */}
					<div className="flex lg:hidden gap-1">
						<button
							onClick={() => onAddToWishlist(id)}
							className="text-gray-500 hover:text-primary-600 transition-colors"
							aria-label="Add to wishlist"
						>
							<Heart size={16} />
						</button>
						<button
							onClick={() => onAddToCart(id)}
							className="text-gray-500 hover:text-primary-600 transition-colors"
							aria-label="Add to cart"
						>
							<ShoppingCart size={16} />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProductCardCompact;
