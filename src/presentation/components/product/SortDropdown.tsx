import React, {useState, useRef, useEffect} from "react";
import {ChevronDown} from "lucide-react";

interface SortOption {
	id: string;
	label: string;
}

interface SortDropdownProps {
	options: SortOption[];
	selectedOption: string;
	onSortChange: (option: string) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({
	options,
	selectedOption,
	onSortChange,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Cerrar dropdown al hacer clic fuera
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Obtener etiqueta de la opción seleccionada
	const getSelectedLabel = () => {
		const option = options.find((opt) => opt.id === selectedOption);
		return option ? option.label : "Ordenar por";
	};

	// Manejar selección de opción
	const handleSelect = (optionId: string) => {
		onSortChange(optionId);
		setIsOpen(false);
	};

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="cursor-pointer flex items-center px-4 py-2 bg-white rounded-lg shadow border border-gray-200 text-gray-700 hover:bg-gray-50"
			>
				<span className="mr-2">{getSelectedLabel()}</span>
				<ChevronDown
					size={16}
					className={`transition-transform ${isOpen ? "transform rotate-180" : ""}`}
				/>
			</button>

			{isOpen && (
				<div className="absolute right-0 mt-2 z-10 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
					{options.map((option) => (
						<button
							key={option.id}
							onClick={() => handleSelect(option.id)}
							className={`block w-full text-left px-4 py-2 text-sm ${
								selectedOption === option.id
									? "bg-primary-50 text-primary-700 font-medium"
									: "text-gray-700 hover:bg-gray-50"
							}`}
						>
							{option.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
};

export default SortDropdown;
