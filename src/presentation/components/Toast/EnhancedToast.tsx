
// src/presentation/components/Toast/EnhancedToast.tsx
import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle, RefreshCw } from 'lucide-react';

export interface ToastProps {
	id: string;
	type: 'success' | 'error' | 'warning' | 'info';
	message: string;
	duration?: number;
	onClose: (id: string) => void;
	actionButton?: {
		label: string;
		onClick: () => void;
	};
}

const EnhancedToast: React.FC<ToastProps> = ({
	id,
	type,
	message,
	duration = 5000,
	onClose,
	actionButton
}) => {
	const [isVisible, setIsVisible] = useState(true);
	const [timeLeft, setTimeLeft] = useState(duration);

	useEffect(() => {
		if (duration <= 0) return;

		const interval = setInterval(() => {
			setTimeLeft(prev => {
				if (prev <= 100) {
					setIsVisible(false);
					setTimeout(() => onClose(id), 300);
					return 0;
				}
				return prev - 100;
			});
		}, 100);

		return () => clearInterval(interval);
	}, [duration, id, onClose]);

	const getIcon = () => {
		switch (type) {
			case 'success':
				return <CheckCircle size={20} className="text-green-500" />;
			case 'error':
				return <AlertCircle size={20} className="text-red-500" />;
			case 'warning':
				return <AlertTriangle size={20} className="text-yellow-500" />;
			case 'info':
				return <Info size={20} className="text-blue-500" />;
			default:
				return <Info size={20} className="text-gray-500" />;
		}
	};

	const getStyles = () => {
		const baseStyles = "border-l-4 shadow-lg";
		switch (type) {
			case 'success':
				return `${baseStyles} bg-green-50 border-green-400 text-green-800`;
			case 'error':
				return `${baseStyles} bg-red-50 border-red-400 text-red-800`;
			case 'warning':
				return `${baseStyles} bg-yellow-50 border-yellow-400 text-yellow-800`;
			case 'info':
				return `${baseStyles} bg-blue-50 border-blue-400 text-blue-800`;
			default:
				return `${baseStyles} bg-gray-50 border-gray-400 text-gray-800`;
		}
	};

	const progressPercentage = duration > 0 ? (timeLeft / duration) * 100 : 0;

	return (
		<div
			className={`
				mb-3 rounded-lg p-4 transition-all duration-300 max-w-md w-full
				${getStyles()}
				${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
			`}
		>
			<div className="flex items-start">
				<div className="flex-shrink-0 mr-3">
					{getIcon()}
				</div>
				
				<div className="flex-1 min-w-0">
					<p className="text-sm font-medium leading-5">
						{message}
					</p>
					
					{actionButton && (
						<div className="mt-2">
							<button
								onClick={actionButton.onClick}
								className="text-xs font-medium underline hover:no-underline focus:outline-none"
							>
								<RefreshCw size={12} className="inline mr-1" />
								{actionButton.label}
							</button>
						</div>
					)}
				</div>
				
				<button
					onClick={() => onClose(id)}
					className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 focus:outline-none"
				>
					<X size={16} />
				</button>
			</div>
			
			{/* Barra de progreso */}
			{duration > 0 && (
				<div className="mt-3 w-full bg-gray-200 rounded-full h-1">
					<div
						className={`h-1 rounded-full transition-all duration-100 ease-linear ${
							type === 'success' ? 'bg-green-500' :
							type === 'error' ? 'bg-red-500' :
							type === 'warning' ? 'bg-yellow-500' :
							'bg-blue-500'
						}`}
						style={{ width: `${progressPercentage}%` }}
					/>
				</div>
			)}
		</div>
	);
};

export default EnhancedToast;