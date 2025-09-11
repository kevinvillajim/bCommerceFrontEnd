import React, {useState} from "react";
import {X} from "lucide-react";

interface PriceFilterSectionProps {
	initialMin: number;
	initialMax: number;
	selectedRange: {min: number; max: number} | null;
	isExpanded: boolean;
	onToggle: () => void;
	onApply: (min: number, max: number) => void;
	onClear: () => void;
}

const PriceFilterSection: React.FC<PriceFilterSectionProps> = ({
	initialMin,
	initialMax,
	selectedRange,
	isExpanded,
	onToggle,
	onApply,
	onClear,
}) => {
	// Inicializar con el rango seleccionado o los valores iniciales
	const [minPrice, setMinPrice] = useState<number>(
		selectedRange?.min || initialMin
	);
	const [maxPrice, setMaxPrice] = useState<number>(
		selectedRange?.max || initialMax
	);

	// Manejar cambio en el precio mínimo
	const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value);
		setMinPrice(isNaN(value) ? initialMin : value);
	};

	// Manejar cambio en el precio máximo
	const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value);
		setMaxPrice(isNaN(value) ? initialMax : value);
	};

	// Aplicar el filtro de precio
	const handleApply = () => {
		// Asegurarse de que min no es mayor que max
		const validMin = Math.min(minPrice, maxPrice);
		const validMax = Math.max(minPrice, maxPrice);
		onApply(validMin, validMax);
	};

	return (
		<div className="border-b border-gray-200 pb-4">
			<button
				className="flex justify-between items-center w-full py-2 text-left font-medium text-gray-700 hover:text-gray-900"
				onClick={onToggle}
			>
				Precio
				{isExpanded ? (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="m18 15-6-6-6 6" />
					</svg>
				) : (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="m6 9 6 6 6-6" />
					</svg>
				)}
			</button>

			{isExpanded && (
				<div className="mt-2 space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="min-price"
								className="block text-sm text-gray-500 mb-1"
							>
								Mínimo
							</label>
							<input
								type="number"
								id="min-price"
								min={initialMin}
								max={initialMax}
								value={minPrice}
								onChange={handleMinChange}
								className="w-full p-2 border border-gray-300 rounded"
							/>
						</div>
						<div>
							<label
								htmlFor="max-price"
								className="block text-sm text-gray-500 mb-1"
							>
								Máximo
							</label>
							<input
								type="number"
								id="max-price"
								min={initialMin}
								max={initialMax}
								value={maxPrice}
								onChange={handleMaxChange}
								className="w-full p-2 border border-gray-300 rounded"
							/>
						</div>
					</div>

					<div className="flex space-x-2">
						<button
							onClick={handleApply}
							className="flex-1 bg-primary-600 text-white py-2 px-4 rounded hover:bg-primary-700 text-sm"
						>
							Aplicar
						</button>

						{selectedRange && (
							<button
								onClick={onClear}
								className="bg-gray-200 text-gray-700 py-2 px-3 rounded hover:bg-gray-300 text-sm"
							>
								<X size={18} />
							</button>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default PriceFilterSection;
