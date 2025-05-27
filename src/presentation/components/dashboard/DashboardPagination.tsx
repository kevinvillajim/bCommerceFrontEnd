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
	if (totalPages <= 1) return null;

	const getPageNumbers = () => {
		const pages: (number | string)[] = [];

		pages.push(1);

		if (currentPage > 3) pages.push("...");

		for (
			let i = Math.max(2, currentPage - 1);
			i <= Math.min(totalPages - 1, currentPage + 1);
			i++
		) {
			if (i > 1 && i < totalPages) {
				pages.push(i);
			}
		}

		if (currentPage < totalPages - 2) pages.push("...");

		if (totalPages > 1) pages.push(totalPages);

		return pages;
	};

	const pages = getPageNumbers();

	return (
		<div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between px-6 py-3 border-t border-gray-200">
			<div>
				<p className="text-sm text-gray-700">
					Mostrando página <span className="font-medium">{currentPage}</span> de{" "}
					<span className="font-medium">{totalPages}</span>
				</p>
			</div>
			<div>
				<nav
					className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
					aria-label="Pagination"
				>
					{/* Botón Anterior */}
					<button
						onClick={() => onPageChange(currentPage - 1)}
						disabled={currentPage === 1}
						className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed"
					>
						<span className="sr-only">Anterior</span>
						<ChevronLeft className="h-5 w-5" />
					</button>

					{/* Botones de página */}
					{pages.map((page, index) =>
						typeof page === "number" ? (
							<button
								key={index}
								onClick={() => onPageChange(page)}
								className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
									currentPage === page
										? "z-10 bg-primary-50 border-primary-500 text-primary-600"
										: "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
								}`}
							>
								{page}
							</button>
						) : (
							<span
								key={index}
								className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm text-gray-700"
							>
								{page}
							</span>
						)
					)}

					{/* Botón Siguiente */}
					<button
						onClick={() => onPageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
						className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed"
					>
						<span className="sr-only">Siguiente</span>
						<ChevronRight className="h-5 w-5" />
					</button>
				</nav>
			</div>
		</div>
	);
};

export default Pagination;
