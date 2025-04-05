import { type RouteObject} from 'react-router';

// Layouts
import MainLayout from '../presentation/layouts/MainLayout';
import DashboardLayout from "../presentation/layouts/DashboardLayout";
import SellerLayout from "../presentation/layouts/SellerLayout";
import AdminLayout from "../presentation/layouts/AdminLayout";

//Public Pages
import HomePage from '../presentation/pages/HomePage';
import ProductItemPage from '../presentation/pages/ProductItemPage';
import ProductPage from '../presentation/pages/ProductPage';
import LoginPage from '../presentation/pages/LoginPage';
import RegisterPage from '../presentation/pages/RegisterPage';
import NotFoundPage from '../presentation/pages/NotFoundPage';
import CategoryPage from '../presentation/pages/CategoryPage';
import ContactPage from '../presentation/pages/ContactPage';
import FAQPage from '../presentation/pages/FAQPage';
import ForgotPasswordPage from '@/presentation/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/presentation/pages/ResetPasswordPage';

// User Pages
import UserProfilePage from '../presentation/pages/UserProfilePage';
import CartPage from '../presentation/pages/CartPage';
import FavoritePage from '../presentation/pages/FavoritePage';
// import CheckoutPage from "../presentation/pages/CheckoutPage";
// import OrdersPage from "../presentation/pages/OrdersPage";
// import OrderDetailsPage from "../presentation/pages/OrderDetailsPage";

// Seller Pages
import SellerDashboard from "../presentation/pages/seller/SellerDashboard";
import SellerProductsPage from "../presentation/pages/seller/SellerProductsPage";
import SellerProductCreatePage from "../presentation/pages/seller/SellerProductCreatePage";
// import SellerProductEditPage from "../presentation/pages/seller/SellerProductEditPage";
// import SellerOrdersPage from "../presentation/pages/seller/SellerOrdersPage";
// import SellerOrderDetailsPage from "../presentation/pages/seller/SellerOrderDetailsPage";
// import SellerRatingsPage from "../presentation/pages/seller/SellerRatingsPage";
// import SellerProfilePage from "../presentation/pages/seller/SellerProfilePage";
// import SellerInvoicesPage from "../presentation/pages/seller/SellerInvoicesPage";
// import SellerInvoiceDetailsPage from "../presentation/pages/seller/SellerInvoiceDetailsPage";
// import SellerMessagesPage from "../presentation/pages/seller/SellerMessagesPage";
// import SellerSettingsPage from "../presentation/pages/seller/SellerSettingsPage";
// import SellerEarningsPage from "../presentation/pages/seller/SellerEarningsPage";
// import SellerShippingPage from "../presentation/pages/seller/SellerShippingPage";

//Admin Pages
import AdminDashboard from "../presentation/pages/admin/AdminDashboard";
import AdminUsersPage from "../presentation/pages/admin/AdminUsersPage";
// import AdminSellersPage from "../presentation/pages/admin/AdminSellersPage";
// import AdminProductsPage from "../presentation/pages/admin/AdminProductsPage";
// import AdminCategoriesPage from "../presentation/pages/admin/AdminCategoriesPage";
// import AdminOrdersPage from "../presentation/pages/admin/AdminOrdersPage";
// import AdminRatingsPage from "../presentation/pages/admin/AdminRatingsPage";
// import AdminFeedbackPage from "../presentation/pages/admin/AdminFeedbackPage";
// import AdminInvoicesPage from "../presentation/pages/admin/AdminInvoicesPage";
// import AdminAccountingPage from "../presentation/pages/admin/AdminAccountingPage";
// import AdminSettingsPage from "../presentation/pages/admin/AdminSettingsPage";
// import AdminDiscountsPage from "../presentation/pages/admin/AdminDiscountsPage";
// import AdminLogViewerPage from "../presentation/pages/admin/AdminLogViewerPage";
// import AdminShippingPage from "../presentation/pages/admin/AdminShippingPage";

//Route Guards
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import SellerRoute from "./SellerRoute";
import AdminRoute from "./AdminRoute";

// Auth guard helper
const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('auth_token');
  return !!token;
};

// Define las rutas
const appRoutes: RouteObject[] = [
	//Public Routes
	{
		path: "/",
		element: <MainLayout />,
		children: [
			{
				index: true,
				element: (
					<PublicRoute>
						<HomePage />
					</PublicRoute>
				),
			},
			{
				path: "products/:slug",
				element: (
					<PublicRoute>
						<ProductItemPage />
					</PublicRoute>
				),
			},
			{
				path: "products",
				element: (
					<PublicRoute>
						<ProductPage />
					</PublicRoute>
				),
			},
			{
				path: "categories",
				element: (
					<PublicRoute>
						<CategoryPage />
					</PublicRoute>
				),
			},
			{
				path: "categories/:slug",
				element: (
					<PublicRoute>
						<CategoryPage />
					</PublicRoute>
				),
			},
			{
				path: "contact",
				element: (
					<PublicRoute>
						<ContactPage />
					</PublicRoute>
				),
			},
			{
				path: "faq",
				element: (
					<PublicRoute>
						<FAQPage />
					</PublicRoute>
				),
			},
			{
				path: "favorites",
				element: (
					<PublicRoute>
						<FavoritePage />
					</PublicRoute>
				),
			},
			{
				path: "cart",
				element: (
					<PublicRoute>
						<CartPage />
					</PublicRoute>
				),
			},
			// {
			// 	path: "checkout",
			// 	element: (
			// 		<PrivateRoute>
			// 			<CheckoutPage />
			// 		</PrivateRoute>
			// 	),
			// },
			{
				path: "favorites",
				element: (
					<PrivateRoute>
						<FavoritePage />
					</PrivateRoute>
				),
			},
			{
				path: "profile",
				element: (
					<PrivateRoute>
						<UserProfilePage />
					</PrivateRoute>
				),
			},
			// {
			// 	path: "orders",
			// 	element: (
			// 		<PrivateRoute>
			// 			<OrdersPage />
			// 		</PrivateRoute>
			// 	),
			// },
			// {
			// 	path: "orders/:id",
			// 	element: (
			// 		<PrivateRoute>
			// 			<OrderDetailsPage />
			// 		</PrivateRoute>
			// 	),
			// },
			//Auth Routes
			{
				path: "login",
				loader: () => {
					if (isAuthenticated()) {
						return {redirect: "/"};
					}
					return null;
				},
				element: <LoginPage />,
			},
			{
				path: "register",
				loader: () => {
					if (isAuthenticated()) {
						return {redirect: "/"};
					}
					return null;
				},
				element: <RegisterPage />,
			},
			{
				path: "forgot-password",
				element: <ForgotPasswordPage />,
			},
			{
				path: "reset-password",
				element: <ResetPasswordPage />,
			},
		],
	},
	{
		path: "/dashboard",
		element: (
			<PrivateRoute>
				<DashboardLayout />
			</PrivateRoute>
		),
		children: [
			// Define customer dashboard routes if needed
		],
	},
	{
		path: "/seller",
		element: (
			<SellerRoute>
				<SellerLayout />
			</SellerRoute>
		),
		children: [
			{
				index: true,
				element: <SellerDashboard />,
			},
			{
				path: "dashboard",
				element: <SellerDashboard />,
			},
			// Products
			{
				path: "products",
				element: <SellerProductsPage />,
			},
			{
				path: "products/create",
				element: <SellerProductCreatePage />,
			},
			// {
			// 	path: "products/edit/:id",
			// 	element: <SellerProductEditPage />,
			// },
			// // Orders
			// {
			// 	path: "orders",
			// 	element: <SellerOrdersPage />,
			// },
			// {
			// 	path: "orders/:id",
			// 	element: <SellerOrderDetailsPage />,
			// },
			// // Shipping
			// {
			// 	path: "shipping",
			// 	element: <SellerShippingPage />,
			// },
			// // Ratings
			// {
			// 	path: "ratings",
			// 	element: <SellerRatingsPage />,
			// },
			// // Messages
			// {
			// 	path: "messages",
			// 	element: <SellerMessagesPage />,
			// },
			// // Finances
			// {
			// 	path: "invoices",
			// 	element: <SellerInvoicesPage />,
			// },
			// {
			// 	path: "invoices/:id",
			// 	element: <SellerInvoiceDetailsPage />,
			// },
			// {
			// 	path: "earnings",
			// 	element: <SellerEarningsPage />,
			// },
			// // Account
			// {
			// 	path: "profile",
			// 	element: <SellerProfilePage />,
			// },
			// {
			// 	path: "settings",
			// 	element: <SellerSettingsPage />,
			// },
		],
	},

	// Admin Dashboard Routes
	{
		path: "/admin",
		element: (
			<AdminRoute>
				<AdminLayout />
			</AdminRoute>
		),
		children: [
			{
				index: true,
				element: <AdminDashboard />,
			},
			{
				path: "dashboard",
				element: <AdminDashboard />,
			},
			// User Management
			{
				path: "users",
				element: <AdminUsersPage />,
			},
			// {
			// 	path: "sellers",
			// 	element: <AdminSellersPage />,
			// },
			// // Product Management
			// {
			// 	path: "products",
			// 	element: <AdminProductsPage />,
			// },
			// {
			// 	path: "categories",
			// 	element: <AdminCategoriesPage />,
			// },
			// // Order Management
			// {
			// 	path: "orders",
			// 	element: <AdminOrdersPage />,
			// },
			// {
			// 	path: "shipping",
			// 	element: <AdminShippingPage />,
			// },
			// // Content
			// {
			// 	path: "ratings",
			// 	element: <AdminRatingsPage />,
			// },
			// {
			// 	path: "feedback",
			// 	element: <AdminFeedbackPage />,
			// },
			// {
			// 	path: "discounts",
			// 	element: <AdminDiscountsPage />,
			// },
			// // Financial
			// {
			// 	path: "invoices",
			// 	element: <AdminInvoicesPage />,
			// },
			// {
			// 	path: "accounting",
			// 	element: <AdminAccountingPage />,
			// },
			// // System
			// {
			// 	path: "settings",
			// 	element: <AdminSettingsPage />,
			// },
			// {
			// 	path: "logs",
			// 	element: <AdminLogViewerPage />,
			// },
		],
	},

	// 404 Not Found
	{
		path: "*",
		element: <NotFoundPage />,
	},
];



export default appRoutes;