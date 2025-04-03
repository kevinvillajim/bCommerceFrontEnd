import React, {useContext} from "react";
import {Navigate, useLocation} from "react-router-dom";
import {AuthContext} from "../presentation/contexts/AuthContext";
import {routes} from "../constants/routes";

interface SellerRouteProps {
	children: React.ReactNode;
	redirectPath?: string;
}

/**
 * SellerRoute component
 * Ensures that only authenticated sellers can access certain routes
 */
const SellerRoute: React.FC<SellerRouteProps> = ({
	children,
	redirectPath = routes.LOGIN,
}) => {
	const {isAuthenticated, user} = useContext(AuthContext);
	const location = useLocation();

	// Check if user is authenticated and has seller role
	const isSeller = isAuthenticated && user?.role === "seller";

	if (!isSeller) {
		// Redirect to login and store the attempted URL to redirect back after login
		return <Navigate to={redirectPath} state={{from: location}} replace />;
	}

	return <>{children}</>;
};

export default SellerRoute;
