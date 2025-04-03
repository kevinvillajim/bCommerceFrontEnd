import React, {useContext} from "react";
import {Navigate, useLocation} from "react-router-dom";
import {AuthContext} from "../presentation/contexts/AuthContext";
import {routes} from "../constants/routes";

interface AdminRouteProps {
	children: React.ReactNode;
	redirectPath?: string;
}

/**
 * AdminRoute component
 * Ensures that only authenticated admins can access certain routes
 */
const AdminRoute: React.FC<AdminRouteProps> = ({
	children,
	redirectPath = routes.LOGIN,
}) => {
	const {isAuthenticated, user} = useContext(AuthContext);
	const location = useLocation();

	// Check if user is authenticated and has admin role
	const isAdmin = isAuthenticated && user?.role === "admin";

	if (!isAdmin) {
		// Redirect to login and store the attempted URL to redirect back after login
		return <Navigate to={redirectPath} state={{from: location}} replace />;
	}

	return <>{children}</>;
};

export default AdminRoute;
