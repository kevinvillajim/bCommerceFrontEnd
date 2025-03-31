import React from "react";
import {ChevronLeft, ChevronRight} from "lucide-react";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
	currentPage,
	totalPages,
	onPageChange,
}) => {
	// No mostrar paginación si solo hay una página
	if (totalPages <= 1) return null;

	// Determinar qué páginas mostrar
	const getPageNumbers = () => {
		const pages: (number | string)[] = [];

		// Siempre incluir la primera página
		pages.push(1);

		// Mostrar puntos suspensivos si no estamos cerca del principio
		if (currentPage > 3) {
			pages.push("...");
		}

		// Páginas adyacentes a la actual
		for (
			let i = Math.max(2, currentPage - 1);
			i <= Math.min(totalPages - 1, currentPage + 1);
			i++
		) {
			if (i > 1 && i < totalPages) {
				pages.push(i);
			}
		}

		// Mostrar puntos suspensivos si no estamos cerca del final
		if (currentPage < totalPages - 2) {
			pages.push("...");
		}

		// Siempre incluir la última página si hay más de una
		if (totalPages > 1) {
			pages.push(totalPages);
		}

		return pages;
	};

	const pages = getPageNumbers();

	return (
		<div className="hidden md:flex justify-center mt-6">
			<nav
				className="inline-flex items-center rounded-md shadow-sm"
				aria-label="Paginación"
			>
				{/* Botón de página anterior */}
				<button
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className={`relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm ${
						currentPage === 1
							? "text-gray-300 cursor-not-allowed"
							: "text-gray-500 hover:bg-gray-50"
					}`}
				>
					<span className="sr-only">Anterior</span>
					<ChevronLeft size={16} />
				</button>

				{/* Números de página */}
				{pages.map((page, index) => (
					<React.Fragment key={index}>
						{typeof page === "number" ? (
							<button
								onClick={() => onPageChange(page)}
								className={`relative inline-flex items-center border border-gray-300 px-4 py-2 text-sm font-medium ${
									currentPage === page
										? "bg-primary-50 border-primary-500 text-primary-600 z-10"
										: "bg-white text-gray-500 hover:bg-gray-50"
								}`}
							>
								{page}
							</button>
						) : (
							<span className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700">
								{page}
							</span>
						)}
					</React.Fragment>
				))}

				{/* Botón de página siguiente */}
				<button
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className={`relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm ${
						currentPage === totalPages
							? "text-gray-300 cursor-not-allowed"
							: "text-gray-500 hover:bg-gray-50"
					}`}
				>
					<span className="sr-only">Siguiente</span>
					<ChevronRight size={16} />
				</button>
			</nav>
		</div>
	);
};

export default Pagination;
