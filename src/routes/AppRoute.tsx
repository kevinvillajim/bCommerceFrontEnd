import {lazy} from "react";
import type {RouteObject} from "react-router";

// Layouts
const MainLayout = lazy(() => import("../presentation/layouts/MainLayout"));
const DashboardLayout = lazy(
	() => import("../presentation/layouts/DashboardLayout")
);
const SellerLayout = lazy(() => import("../presentation/layouts/SellerLayout"));
const AdminLayout = lazy(() => import("../presentation/layouts/AdminLayout"));

//Public Pages
const HomePage = lazy(() => import("../presentation/pages/HomePage"));
const ProductItemPage = lazy(
	() => import("../presentation/pages/ProductItemPage")
);
const ProductPage = lazy(() => import("../presentation/pages/ProductPage"));
const LoginPage = lazy(() => import("../presentation/pages/LoginPage"));
const RegisterPage = lazy(() => import("../presentation/pages/RegisterPage"));
const NotFoundPage = lazy(() => import("../presentation/pages/NotFoundPage"));
const CategoryPage = lazy(() => import("../presentation/pages/CategoryPage"));
const ContactPage = lazy(() => import("../presentation/pages/ContactPage"));
const FAQPage = lazy(() => import("../presentation/pages/FAQPage"));
const ForgotPasswordPage = lazy(
	() => import("@/presentation/pages/ForgotPasswordPage")
);
const ResetPasswordPage = lazy(
	() => import("@/presentation/pages/ResetPasswordPage")
);
const EmailVerificationSuccessPage = lazy(
	() => import("../presentation/pages/EmailVerificationSuccessPage")
);
const EmailVerificationPendingPage = lazy(
	() => import("../presentation/pages/EmailVerificationPendingPage")
);

// User Pages
const UserProfilePage = lazy(
	() => import("../presentation/pages/UserProfilePage")
);
const CartPage = lazy(() => import("../presentation/pages/CartPage"));
const FavoritePage = lazy(() => import("../presentation/pages/FavoritePage"));
const NotificationPage = lazy(() => import("../presentation/pages/NotificationPage"));
const CheckoutPage = lazy(() => import('../presentation/pages/CheckoutPage'));
const OrdersPage = lazy(() => import('../presentation/pages/OrdersPage'));
const OrderDetailsPage = lazy(() => import('../presentation/pages/OrderDetailClientPage'));

// Seller Pages
const SellerDashboard = lazy(
	() => import("../presentation/pages/seller/SellerDashboard")
);
const SellerProductsPage = lazy(
	() => import("../presentation/pages/seller/SellerProductsPage")
);
const SellerProductCreatePage = lazy(
	() => import("../presentation/pages/seller/SellerProductCreatePage")
);
const SellerProductEditPage = lazy(
	() => import("../presentation/pages/seller/SellerProductEditPage")
);
const SellerOrdersPage = lazy(
	() => import("../presentation/pages/seller/SellerOrdersPage")
);
const SellerOrderDetailPage = lazy(
	() => import("../presentation/pages/seller/SellerOrderDetailPage")
);
const SellerRatingsPage = lazy(
	() => import("../presentation/pages/seller/SellerRatingsPage")
);
const PendingRatingsPage = lazy(
	() => import("../presentation/pages/account/PendingRatingsPage")
);
const SellerProfilePage = lazy(
	() => import("../presentation/pages/seller/SellerProfilePage")
);
const SellerNotificationsPage = lazy(
	() => import("../presentation/pages/seller/SellerNotificationsPage")
);
// const SellerInvoiceDetailsPage = lazy(() => import('../presentation/pages/seller/SellerInvoiceDetailsPage'));
const SellerMessagesPage = lazy(
	() => import("../presentation/pages/seller/SellerMessagesPage")
);
// const SellerSettingsPage = lazy(() => import('../presentation/pages/seller/SellerSettingsPage'));
const SellerEarningsPage = lazy(
	() => import("../presentation/pages/seller/SellerEarningsPage")
);
const SellerShippingPage = lazy(
	() => import("../presentation/pages/seller/SellerShippingPage")
);
const SellerShippingDetailsPage = lazy(
	() => import("../presentation/pages/seller/SellerShippingDetailsPage")
);

//Admin Pages
const AdminDashboard = lazy(
	() => import("../presentation/pages/admin/AdminDashboard")
);
const AdminUsersPage = lazy(
	() => import("../presentation/pages/admin/AdminUsersPage")
);
const AdminSellersPage = lazy(
	() => import("../presentation/pages/admin/AdminSellersPage")
);
const AdminSellerDetailPage = lazy(
	() => import("../presentation/pages/admin/AdminSellerDetailPage")
);
const AdminProductsPage = lazy(
	() => import("../presentation/pages/admin/AdminProductsPage")
);
const AdminCategoriesPage = lazy(
	() => import("../presentation/pages/admin/AdminCategoriesPage")
);
const AdminOrdersPage = lazy(
	() => import("../presentation/pages/admin/AdminOrdersPage")
);

const AdminOrderDetailPage = lazy(
	() => import("../presentation/pages/admin/AdminOrderDetailPage")
);
const AdminRatingsPage = lazy(
	() => import("../presentation/pages/admin/AdminRatingsPage")
);
const AdminFeedbackPage = lazy(
	() => import("../presentation/pages/admin/AdminFeedbackPage")
);
const AdminInvoicesPage = lazy(
	() => import("../presentation/pages/admin/AdminInvoicesPage")
);
const AdminAccountingPage = lazy(
	() => import("../presentation/pages/admin/AdminAccountingPage")
);
const AdminSettingsPage = lazy(
	() => import("../presentation/pages/admin/AdminSettingsPage")
);
const AdminDiscountsPage = lazy(
	() => import("../presentation/pages/admin/AdminDiscountsPage")
);
const AdminLogViewerPage = lazy(
	() => import("../presentation/pages/admin/AdminLogViewerPage")
);
const AdminNotificationsPage = lazy(
	() => import("../presentation/pages/admin/AdminNotificationsPage")
);
const AdminShippingPage = lazy(
	() => import("../presentation/pages/admin/AdminShippingPage")
);
const AdminSolicitudesPage = lazy(
	() => import("../presentation/pages/admin/AdminSolicitudesPage")
);
const AdminProductCreatePage = lazy(
	() => import("../presentation/pages/admin/AdminProductCreatePage")
);
const AdminProductEditPage = lazy(
	() => import("../presentation/pages/admin/AdminProductEditPage")
);
const AdminTestPage = lazy(
	() => import("../presentation/pages/admin/AdminTestPage")
);
const AdminProductsMinimal = lazy(
	() => import("../presentation/pages/admin/AdminProductsMinimal")
);
const UserChatPage = lazy(
	() => import("../presentation/pages/UserChatPage")
);

const DatafastResultPage = lazy(
	() => import("../presentation/pages/DatafastResultPage")
);

const AdminCreateCategoryPage = lazy(()=> import("../presentation/pages/admin/AdminCreateCategoryPage")) ;
const AdminEditCategoryPage = lazy(()=> import("../presentation/pages/admin/AdminEditCategoryPage")) ;
const GoogleAuthSuccessPage = lazy(()=> import("../presentation/pages/GoogleAuthSuccessPage"));
const RatingDetailPage = lazy(() => import("../presentation/pages/RatingDetailPage"));

//Route Guards
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import SellerRoute from "./SellerRoute";
import AdminRoute from "./AdminRoute";
import AuthRoute from "./AuthRoute";
import AboutUs from "@/presentation/pages/AboutUsPage";


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
				path: "products/:id",
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
				path: "about",
				element: (
					<PublicRoute>
						<AboutUs />
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
				path: "chats",
				element: (
					<PrivateRoute>
						<UserChatPage />
					</PrivateRoute>
				),
			},
			{
				path: "chats/:chatId",
				element: (
					<PrivateRoute>
						<UserChatPage />
					</PrivateRoute>
				),
			},
			{
				path: "favorites",
				element: (
					<PrivateRoute>
						<FavoritePage />
					</PrivateRoute>
				),
			},
			{
				path: "cart",
				element: (
					<PrivateRoute>
						<CartPage />
					</PrivateRoute>
				),
			},
			{
				path: "notifications",
				element: (
					<PrivateRoute>
						<NotificationPage />
					</PrivateRoute>
				),
			},
			{
				path: "checkout",
				element: (
					<PrivateRoute>
						<CheckoutPage />
					</PrivateRoute>
				),
			},
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
			{
				path: "orders",
				element: (
					<PrivateRoute>
						<OrdersPage />
					</PrivateRoute>
				),
			},
			{
				path: "orders/:id",
				element: (
					<PrivateRoute>
						<OrderDetailsPage />
					</PrivateRoute>
				),
			},

			//Test

			{
				path: "pending-rating",
				element: (
					<PrivateRoute>
						<PendingRatingsPage />
					</PrivateRoute>
				),
			},
			{
				path: "ratings/:id",
				element: (
					<PrivateRoute>
						<RatingDetailPage />
					</PrivateRoute>
				),
			},

			//Datafast
			{
				path: "datafast-result",
				element: (
					<PrivateRoute>
						<DatafastResultPage />
					</PrivateRoute>
				),
			},

			//Auth Routes
			{
				path: "login",
				element: (
					<AuthRoute>
						<LoginPage />
					</AuthRoute>
				),
			},
			{
				path: "register",
				element: (
					<AuthRoute>
						<RegisterPage />
					</AuthRoute>
				),
			},
			{
				path: "forgot-password",
				element: (
					<AuthRoute>
						<ForgotPasswordPage />
					</AuthRoute>
				),
			},
			{
				path: "reset-password",
				element: (
					<AuthRoute>
						<ResetPasswordPage />
					</AuthRoute>
				),
			},
			{
				path: "verify-email",
				element: (
					<PublicRoute>
						<EmailVerificationPendingPage />
					</PublicRoute>
				),
			},
			{
				path: "email-verification-success",
				element: (
					<PublicRoute>
						<EmailVerificationSuccessPage />
					</PublicRoute>
				),
			},
			{
				path: "email-verification-pending",
				element: (
					<PublicRoute>
						<EmailVerificationPendingPage />
					</PublicRoute>
				),
			},
			{
				path: "auth/google/success",
				element: (
					<PublicRoute>
						<GoogleAuthSuccessPage />
					</PublicRoute>
				),
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
			{
				path: "products/edit/:id",
				element: <SellerProductEditPage />,
			},
			// Orders
			{
				path: "orders",
				element: <SellerOrdersPage />,
			},
			{
				path: "orders/:id",
				element: <SellerOrderDetailPage />,
			},
			{
				path: "shipping/:orderId",
				element: <SellerShippingDetailsPage />,
			},
			// Shipping
			{
				path: "shipping",
				element: <SellerShippingPage />,
			},
			// Ratings
			{
				path: "ratings",
				element: <SellerRatingsPage />,
			},
			{
				path: "ratings/:id",
				element: <RatingDetailPage />,
			},
			// Messages
			{
				path: "messages",
				element: <SellerMessagesPage />,
			},
			{
				path: "messages/:chatId",
				element: <SellerMessagesPage />,
			},
			// Notifications
			{
				path: "notifications",
				element: <SellerNotificationsPage />,
			},
			// Finances
			{
				path: "earnings",
				element: <SellerEarningsPage />,
			},
			// Account
			{
				path: "profile",
				element: <SellerProfilePage />,
			},
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
			{
				path: "sellers",
				element: <AdminSellersPage />,
			},
			{
				path: "sellers/:id",
				element: <AdminSellerDetailPage />,
			},
			{
				path: "solicitudes",
				element: <AdminSolicitudesPage />,
			},
			// Product Management
			{
				path: "products",
				element: <AdminProductsPage />,
			},
			{
				path: "products/create",
				element: <AdminProductCreatePage />,
			},
			{
				path: "products/edit/:id",
				element: <AdminProductEditPage />,
			},
			{
				path: "test",
				element: <AdminTestPage />,
			},
			{
				path: "products-minimal",
				element: <AdminProductsMinimal />,
			},
			{
				path: "categories",
				element: <AdminCategoriesPage />,
			},
			{
				path: "categories",
				element: <AdminCategoriesPage />,
			},
			{
				path: "categories/create",
				element: <AdminCreateCategoryPage />,
			},
			{
				path: "categories/edit/:id",
				element: <AdminEditCategoryPage />,
			},
			// Order Management
			{
				path: "orders",
				element: <AdminOrdersPage />,
			},
			{
				path: "orders/:id",
				element: <AdminOrderDetailPage />,
			},
			{
				path: "shipping",
				element: <AdminShippingPage />,
			},
			// // Content
			{
				path: "ratings",
				element: <AdminRatingsPage />,
			},
			{
				path: "ratings/:id",
				element: <RatingDetailPage />,
			},
			{
				path: "feedback",
				element: <AdminFeedbackPage />,
			},
			{
				path: "notifications",
				element: <AdminNotificationsPage />,
			},
			{
				path: "discounts",
				element: <AdminDiscountsPage />,
			},
			// Financial
			{
				path: "invoices",
				element: <AdminInvoicesPage />,
			},
			{
				path: "accounting",
				element: <AdminAccountingPage />,
			},
			// System
			{
				path: "settings",
				element: <AdminSettingsPage />,
			},
			{
				path: "logs",
				element: <AdminLogViewerPage />,
			},
		],
	},

	// 404 Not Found
	{
		path: "*",
		element: <NotFoundPage />,
	},
];

export default appRoutes;
