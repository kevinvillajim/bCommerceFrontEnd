import React from "react";
import {ChevronLeft, ChevronRight} from "lucide-react";

interface MobilePaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

const MobilePagination: React.FC<MobilePaginationProps> = ({
	currentPage,
	totalPages,
	onPageChange,
}) => {
	// No mostrar paginación si solo hay una página
	if (totalPages <= 1) return null;

	// Manejar cambio a página anterior
	const handlePrevious = () => {
		if (currentPage > 1) {
			onPageChange(currentPage - 1);
		}
	};

	// Manejar cambio a página siguiente
	const handleNext = () => {
		if (currentPage < totalPages) {
			onPageChange(currentPage + 1);
		}
	};

	return (
		<div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 md:hidden">
			<div className="flex flex-1 justify-between">
				<button
					onClick={handlePrevious}
					disabled={currentPage === 1}
					className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
						currentPage === 1
							? "text-gray-300 cursor-not-allowed"
							: "text-gray-700 hover:bg-gray-50"
					}`}
				>
					<ChevronLeft size={16} className="mr-1" />
					Anterior
				</button>

				<div className="text-sm text-gray-700 flex items-center">
					<span>
						Página {currentPage} de {totalPages}
					</span>
				</div>

				<button
					onClick={handleNext}
					disabled={currentPage === totalPages}
					className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
						currentPage === totalPages
							? "text-gray-300 cursor-not-allowed"
							: "text-gray-700 hover:bg-gray-50"
					}`}
				>
					Siguiente
					<ChevronRight size={16} className="ml-1" />
				</button>
			</div>
		</div>
	);
};

export default MobilePagination;
