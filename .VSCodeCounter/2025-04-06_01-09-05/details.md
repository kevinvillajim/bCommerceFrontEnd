# Details

Date : 2025-04-06 01:09:05

Directory c:\\Users\\kevin\\OneDrive\\Desktop\\Proyecto de Programación\\Proyectos Personales\\webBCommerce\\BCommerceFontEnd

Total : 174 files,  29287 codes, 2652 comments, 2656 blanks, all 34595 lines

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [.env](/.env) | Properties | 2 | 0 | 1 | 3 |
| [Dockerfile](/Dockerfile) | Docker | 19 | 0 | 3 | 22 |
| [README.md](/README.md) | Markdown | 58 | 0 | 31 | 89 |
| [index.html](/index.html) | HTML | 13 | 0 | 0 | 13 |
| [package-lock.json](/package-lock.json) | JSON | 5,156 | 0 | 1 | 5,157 |
| [package.json](/package.json) | JSON | 53 | 0 | 1 | 54 |
| [public/SeviceWorker.js](/public/SeviceWorker.js) | JavaScript | 119 | 26 | 30 | 175 |
| [react-router.config.ts](/react-router.config.ts) | TypeScript | 4 | 2 | 2 | 8 |
| [src/App.tsx](/src/App.tsx) | TypeScript JSX | 20 | 3 | 4 | 27 |
| [src/config/appConfig.ts](/src/config/appConfig.ts) | TypeScript | 52 | 6 | 2 | 60 |
| [src/config/environment.ts](/src/config/environment.ts) | TypeScript | 20 | 2 | 3 | 25 |
| [src/constants/apiEndpoints.ts](/src/constants/apiEndpoints.ts) | TypeScript | 169 | 30 | 23 | 222 |
| [src/constants/routes.ts](/src/constants/routes.ts) | TypeScript | 64 | 18 | 7 | 89 |
| [src/core/domain/entities/Accounting.ts](/src/core/domain/entities/Accounting.ts) | TypeScript | 164 | 51 | 15 | 230 |
| [src/core/domain/entities/Category.ts](/src/core/domain/entities/Category.ts) | TypeScript | 58 | 17 | 7 | 82 |
| [src/core/domain/entities/DescountCode.ts](/src/core/domain/entities/DescountCode.ts) | TypeScript | 67 | 25 | 7 | 99 |
| [src/core/domain/entities/Favorite.ts](/src/core/domain/entities/Favorite.ts) | TypeScript | 51 | 22 | 6 | 79 |
| [src/core/domain/entities/Feedback.ts](/src/core/domain/entities/Feedback.ts) | TypeScript | 91 | 25 | 7 | 123 |
| [src/core/domain/entities/Invoice.ts](/src/core/domain/entities/Invoice.ts) | TypeScript | 122 | 40 | 11 | 173 |
| [src/core/domain/entities/Message.ts](/src/core/domain/entities/Message.ts) | TypeScript | 108 | 38 | 11 | 157 |
| [src/core/domain/entities/Notification.ts](/src/core/domain/entities/Notification.ts) | TypeScript | 56 | 24 | 7 | 87 |
| [src/core/domain/entities/Order.ts](/src/core/domain/entities/Order.ts) | TypeScript | 87 | 32 | 9 | 128 |
| [src/core/domain/entities/Product.ts](/src/core/domain/entities/Product.ts) | TypeScript | 100 | 18 | 7 | 125 |
| [src/core/domain/entities/Rating.ts](/src/core/domain/entities/Rating.ts) | TypeScript | 84 | 25 | 7 | 116 |
| [src/core/domain/entities/Seller.ts](/src/core/domain/entities/Seller.ts) | TypeScript | 85 | 30 | 8 | 123 |
| [src/core/domain/entities/ShoppingCart.ts](/src/core/domain/entities/ShoppingCart.ts) | TypeScript | 65 | 33 | 10 | 108 |
| [src/core/domain/entities/User.ts](/src/core/domain/entities/User.ts) | TypeScript | 70 | 27 | 8 | 105 |
| [src/core/domain/entities/UserInteraction.ts](/src/core/domain/entities/UserInteraction.ts) | TypeScript | 99 | 30 | 9 | 138 |
| [src/core/domain/interfaces/IProductService.ts](/src/core/domain/interfaces/IProductService.ts) | TypeScript | 19 | 30 | 9 | 58 |
| [src/core/domain/interfaces/IUserRepository.ts](/src/core/domain/interfaces/IUserRepository.ts) | TypeScript | 16 | 24 | 7 | 47 |
| [src/core/domain/valueObjects/Address.ts](/src/core/domain/valueObjects/Address.ts) | TypeScript | 0 | 0 | 1 | 1 |
| [src/core/domain/valueObjects/Money.ts](/src/core/domain/valueObjects/Money.ts) | TypeScript | 0 | 0 | 1 | 1 |
| [src/core/services/AuthService.ts](/src/core/services/AuthService.ts) | TypeScript | 329 | 87 | 80 | 496 |
| [src/core/services/CategoryService.ts](/src/core/services/CategoryService.ts) | TypeScript | 337 | 54 | 67 | 458 |
| [src/core/services/ProductService.ts](/src/core/services/ProductService.ts) | TypeScript | 356 | 61 | 54 | 471 |
| [src/core/services/RecommendationService.ts](/src/core/services/RecommendationService.ts) | TypeScript | 0 | 0 | 1 | 1 |
| [src/core/useCases/product/CreateProductUseCase.ts](/src/core/useCases/product/CreateProductUseCase.ts) | TypeScript | 0 | 0 | 1 | 1 |
| [src/core/useCases/product/GetProductDetailsUseCase.ts](/src/core/useCases/product/GetProductDetailsUseCase.ts) | TypeScript | 0 | 0 | 1 | 1 |
| [src/core/useCases/product/SearchProductsUseCase.ts](/src/core/useCases/product/SearchProductsUseCase.ts) | TypeScript | 11 | 2 | 3 | 16 |
| [src/core/useCases/user/LoginUseCase.ts](/src/core/useCases/user/LoginUseCase.ts) | TypeScript | 33 | 15 | 9 | 57 |
| [src/core/useCases/user/RegisterUseCase.ts](/src/core/useCases/user/RegisterUseCase.ts) | TypeScript | 36 | 16 | 10 | 62 |
| [src/core/useCases/user/UpdateProfileUseCase.ts](/src/core/useCases/user/UpdateProfileUseCase.ts) | TypeScript | 30 | 14 | 7 | 51 |
| [src/infrastructure/api/apiClient.ts](/src/infrastructure/api/apiClient.ts) | TypeScript | 214 | 87 | 56 | 357 |
| [src/infrastructure/api/axiosConfig.ts](/src/infrastructure/api/axiosConfig.ts) | TypeScript | 107 | 23 | 28 | 158 |
| [src/infrastructure/api/endpoints.ts](/src/infrastructure/api/endpoints.ts) | TypeScript | 0 | 0 | 1 | 1 |
| [src/infrastructure/repositories/HttpProductRepository.ts](/src/infrastructure/repositories/HttpProductRepository.ts) | TypeScript | 0 | 0 | 1 | 1 |
| [src/infrastructure/repositories/HttpUserRepository.ts](/src/infrastructure/repositories/HttpUserRepository.ts) | TypeScript | 47 | 6 | 8 | 61 |
| [src/infrastructure/services/CacheService.ts](/src/infrastructure/services/CacheService.ts) | TypeScript | 41 | 24 | 8 | 73 |
| [src/infrastructure/services/HttpAuthService.ts](/src/infrastructure/services/HttpAuthService.ts) | TypeScript | 0 | 0 | 1 | 1 |
| [src/infrastructure/services/LocalStorageService.ts](/src/infrastructure/services/LocalStorageService.ts) | TypeScript | 48 | 29 | 6 | 83 |
| [src/infrastructure/services/PrefetchService.ts](/src/infrastructure/services/PrefetchService.ts) | TypeScript | 117 | 32 | 21 | 170 |
| [src/infrastructure/services/RoleService.ts](/src/infrastructure/services/RoleService.ts) | TypeScript | 79 | 29 | 16 | 124 |
| [src/main.tsx](/src/main.tsx) | TypeScript JSX | 55 | 5 | 5 | 65 |
| [src/presentation/components/FAQ/FAQBase.tsx](/src/presentation/components/FAQ/FAQBase.tsx) | TypeScript JSX | 139 | 13 | 17 | 169 |
| [src/presentation/components/common/ApiChecker.tsx](/src/presentation/components/common/ApiChecker.tsx) | TypeScript JSX | 141 | 5 | 20 | 166 |
| [src/presentation/components/common/ApiDebugger.tsx](/src/presentation/components/common/ApiDebugger.tsx) | TypeScript JSX | 203 | 23 | 25 | 251 |
| [src/presentation/components/common/Button.tsx](/src/presentation/components/common/Button.tsx) | TypeScript JSX | 0 | 0 | 1 | 1 |
| [src/presentation/components/common/Categories.tsx](/src/presentation/components/common/Categories.tsx) | TypeScript JSX | 45 | 0 | 7 | 52 |
| [src/presentation/components/common/Footer.tsx](/src/presentation/components/common/Footer.tsx) | TypeScript JSX | 162 | 12 | 15 | 189 |
| [src/presentation/components/common/Header.tsx](/src/presentation/components/common/Header.tsx) | TypeScript JSX | 342 | 30 | 32 | 404 |
| [src/presentation/components/common/ImageSlider.tsx](/src/presentation/components/common/ImageSlider.tsx) | TypeScript JSX | 92 | 9 | 14 | 115 |
| [src/presentation/components/common/Input.tsx](/src/presentation/components/common/Input.tsx) | TypeScript JSX | 0 | 0 | 1 | 1 |
| [src/presentation/components/common/PriceRangeInput.tsx](/src/presentation/components/common/PriceRangeInput.tsx) | TypeScript JSX | 71 | 4 | 10 | 85 |
| [src/presentation/components/common/ProductCards.tsx](/src/presentation/components/common/ProductCards.tsx) | TypeScript JSX | 90 | 9 | 10 | 109 |
| [src/presentation/components/common/RatingStars.tsx](/src/presentation/components/common/RatingStars.tsx) | TypeScript JSX | 60 | 2 | 7 | 69 |
| [src/presentation/components/common/TextSlider.tsx](/src/presentation/components/common/TextSlider.tsx) | TypeScript JSX | 72 | 5 | 11 | 88 |
| [src/presentation/components/common/ThemeToggle.tsx](/src/presentation/components/common/ThemeToggle.tsx) | TypeScript JSX | 24 | 3 | 4 | 31 |
| [src/presentation/components/common/WhyUs.tsx](/src/presentation/components/common/WhyUs.tsx) | TypeScript JSX | 36 | 0 | 5 | 41 |
| [src/presentation/components/dashboard/BaseDashboardLayout.tsx](/src/presentation/components/dashboard/BaseDashboardLayout.tsx) | TypeScript JSX | 69 | 22 | 16 | 107 |
| [src/presentation/components/dashboard/DashboardContext.tsx](/src/presentation/components/dashboard/DashboardContext.tsx) | TypeScript JSX | 146 | 27 | 34 | 207 |
| [src/presentation/components/dashboard/DashboardFooter.tsx](/src/presentation/components/dashboard/DashboardFooter.tsx) | TypeScript JSX | 35 | 13 | 7 | 55 |
| [src/presentation/components/dashboard/DashboardHeader.tsx](/src/presentation/components/dashboard/DashboardHeader.tsx) | TypeScript JSX | 260 | 20 | 27 | 307 |
| [src/presentation/components/dashboard/DashboardPagination.tsx](/src/presentation/components/dashboard/DashboardPagination.tsx) | TypeScript JSX | 88 | 3 | 15 | 106 |
| [src/presentation/components/dashboard/GroupLinkSideBar.tsx](/src/presentation/components/dashboard/GroupLinkSideBar.tsx) | TypeScript JSX | 32 | 0 | 9 | 41 |
| [src/presentation/components/dashboard/LinkSideBar.tsx](/src/presentation/components/dashboard/LinkSideBar.tsx) | TypeScript JSX | 36 | 0 | 8 | 44 |
| [src/presentation/components/dashboard/SideBar.tsx](/src/presentation/components/dashboard/SideBar.tsx) | TypeScript JSX | 98 | 20 | 13 | 131 |
| [src/presentation/components/dashboard/Table.tsx](/src/presentation/components/dashboard/Table.tsx) | TypeScript JSX | 197 | 9 | 16 | 222 |
| [src/presentation/components/dashboard/index.ts](/src/presentation/components/dashboard/index.ts) | TypeScript | 12 | 3 | 4 | 19 |
| [src/presentation/components/product/ActiveFilters.tsx](/src/presentation/components/product/ActiveFilters.tsx) | TypeScript JSX | 135 | 8 | 12 | 155 |
| [src/presentation/components/product/CategoriesCarousel.tsx](/src/presentation/components/product/CategoriesCarousel.tsx) | TypeScript JSX | 167 | 14 | 19 | 200 |
| [src/presentation/components/product/CategoriesProduct.tsx](/src/presentation/components/product/CategoriesProduct.tsx) | TypeScript JSX | 53 | 3 | 8 | 64 |
| [src/presentation/components/product/CategoryFilterSection.tsx](/src/presentation/components/product/CategoryFilterSection.tsx) | TypeScript JSX | 123 | 3 | 15 | 141 |
| [src/presentation/components/product/DiscountFilterSection.tsx](/src/presentation/components/product/DiscountFilterSection.tsx) | TypeScript JSX | 64 | 3 | 5 | 72 |
| [src/presentation/components/product/FilterSection.tsx](/src/presentation/components/product/FilterSection.tsx) | TypeScript JSX | 35 | 3 | 4 | 42 |
| [src/presentation/components/product/MobileFilterPanel.tsx](/src/presentation/components/product/MobileFilterPanel.tsx) | TypeScript JSX | 171 | 10 | 14 | 195 |
| [src/presentation/components/product/MobilePagination.tsx](/src/presentation/components/product/MobilePagination.tsx) | TypeScript JSX | 85 | 16 | 13 | 114 |
| [src/presentation/components/product/Pagination.tsx](/src/presentation/components/product/Pagination.tsx) | TypeScript JSX | 92 | 10 | 15 | 117 |
| [src/presentation/components/product/PriceFilterSection.tsx](/src/presentation/components/product/PriceFilterSection.tsx) | TypeScript JSX | 136 | 5 | 11 | 152 |
| [src/presentation/components/product/ProductCardCompact.tsx](/src/presentation/components/product/ProductCardCompact.tsx) | TypeScript JSX | 130 | 11 | 13 | 154 |
| [src/presentation/components/product/ProductCarousel.tsx](/src/presentation/components/product/ProductCarousel.tsx) | TypeScript JSX | 212 | 23 | 19 | 254 |
| [src/presentation/components/product/ProductFilters.tsx](/src/presentation/components/product/ProductFilters.tsx) | TypeScript JSX | 356 | 22 | 31 | 409 |
| [src/presentation/components/product/ProductGrid.tsx](/src/presentation/components/product/ProductGrid.tsx) | TypeScript JSX | 140 | 10 | 12 | 162 |
| [src/presentation/components/product/ProductList.tsx](/src/presentation/components/product/ProductList.tsx) | TypeScript JSX | 0 | 0 | 1 | 1 |
| [src/presentation/components/product/RatingFilterSection.tsx](/src/presentation/components/product/RatingFilterSection.tsx) | TypeScript JSX | 68 | 4 | 5 | 77 |
| [src/presentation/components/product/SearchBar.tsx](/src/presentation/components/product/SearchBar.tsx) | TypeScript JSX | 71 | 5 | 9 | 85 |
| [src/presentation/components/product/SimplePagination.tsx](/src/presentation/components/product/SimplePagination.tsx) | TypeScript JSX | 48 | 4 | 6 | 58 |
| [src/presentation/components/product/SortDropdown.tsx](/src/presentation/components/product/SortDropdown.tsx) | TypeScript JSX | 73 | 3 | 11 | 87 |
| [src/presentation/components/profile/OrdersTab.tsx](/src/presentation/components/profile/OrdersTab.tsx) | TypeScript JSX | 200 | 11 | 19 | 230 |
| [src/presentation/components/profile/PersonalInfoTab.tsx](/src/presentation/components/profile/PersonalInfoTab.tsx) | TypeScript JSX | 296 | 19 | 33 | 348 |
| [src/presentation/components/profile/ProfileSidebar.tsx](/src/presentation/components/profile/ProfileSidebar.tsx) | TypeScript JSX | 150 | 9 | 10 | 169 |
| [src/presentation/components/profile/SecurityTab.tsx](/src/presentation/components/profile/SecurityTab.tsx) | TypeScript JSX | 203 | 13 | 22 | 238 |
| [src/presentation/components/user/LoginForm.tsx](/src/presentation/components/user/LoginForm.tsx) | TypeScript JSX | 0 | 0 | 1 | 1 |
| [src/presentation/components/user/ProfileCard.tsx](/src/presentation/components/user/ProfileCard.tsx) | TypeScript JSX | 0 | 0 | 1 | 1 |
| [src/presentation/contexts/AuthContext.tsx](/src/presentation/contexts/AuthContext.tsx) | TypeScript JSX | 238 | 34 | 38 | 310 |
| [src/presentation/contexts/CartContext.tsx](/src/presentation/contexts/CartContext.tsx) | TypeScript JSX | 452 | 46 | 61 | 559 |
| [src/presentation/contexts/FavoriteContext.tsx](/src/presentation/contexts/FavoriteContext.tsx) | TypeScript JSX | 106 | 6 | 16 | 128 |
| [src/presentation/contexts/NotificationContext.tsx](/src/presentation/contexts/NotificationContext.tsx) | TypeScript JSX | 121 | 9 | 22 | 152 |
| [src/presentation/contexts/ThemeContext.tsx](/src/presentation/contexts/ThemeContext.tsx) | TypeScript JSX | 63 | 11 | 19 | 93 |
| [src/presentation/hooks/index.ts](/src/presentation/hooks/index.ts) | TypeScript | 10 | 0 | 0 | 10 |
| [src/presentation/hooks/useAuth.ts](/src/presentation/hooks/useAuth.ts) | TypeScript | 145 | 30 | 23 | 198 |
| [src/presentation/hooks/useCart.ts](/src/presentation/hooks/useCart.ts) | TypeScript | 65 | 2 | 9 | 76 |
| [src/presentation/hooks/useCategories.ts](/src/presentation/hooks/useCategories.ts) | TypeScript | 314 | 53 | 65 | 432 |
| [src/presentation/hooks/useFavorites.ts](/src/presentation/hooks/useFavorites.ts) | TypeScript | 6 | 0 | 2 | 8 |
| [src/presentation/hooks/useFilterState.ts](/src/presentation/hooks/useFilterState.ts) | TypeScript | 109 | 14 | 18 | 141 |
| [src/presentation/hooks/useNotifications.ts](/src/presentation/hooks/useNotifications.ts) | TypeScript | 6 | 0 | 2 | 8 |
| [src/presentation/hooks/useProductFilters.ts](/src/presentation/hooks/useProductFilters.ts) | TypeScript | 255 | 27 | 43 | 325 |
| [src/presentation/hooks/useProductSearch.ts](/src/presentation/hooks/useProductSearch.ts) | TypeScript | 64 | 9 | 16 | 89 |
| [src/presentation/hooks/useProducts.ts](/src/presentation/hooks/useProducts.ts) | TypeScript | 390 | 55 | 65 | 510 |
| [src/presentation/hooks/useTheme.ts](/src/presentation/hooks/useTheme.ts) | TypeScript | 10 | 4 | 4 | 18 |
| [src/presentation/layouts/AdminLayout.tsx](/src/presentation/layouts/AdminLayout.tsx) | TypeScript JSX | 99 | 11 | 13 | 123 |
| [src/presentation/layouts/DashboardLayout.tsx](/src/presentation/layouts/DashboardLayout.tsx) | TypeScript JSX | 155 | 10 | 11 | 176 |
| [src/presentation/layouts/MainLayout.tsx](/src/presentation/layouts/MainLayout.tsx) | TypeScript JSX | 39 | 7 | 8 | 54 |
| [src/presentation/layouts/SellerLayout.tsx](/src/presentation/layouts/SellerLayout.tsx) | TypeScript JSX | 53 | 8 | 8 | 69 |
| [src/presentation/layouts/groups/adminGroups.tsx](/src/presentation/layouts/groups/adminGroups.tsx) | TypeScript JSX | 145 | 0 | 4 | 149 |
| [src/presentation/layouts/groups/sellerGroups.tsx](/src/presentation/layouts/groups/sellerGroups.tsx) | TypeScript JSX | 112 | 0 | 4 | 116 |
| [src/presentation/pages/AboutUsPage.tsx](/src/presentation/pages/AboutUsPage.tsx) | TypeScript JSX | 260 | 7 | 26 | 293 |
| [src/presentation/pages/CartPage.tsx](/src/presentation/pages/CartPage.tsx) | TypeScript JSX | 298 | 24 | 34 | 356 |
| [src/presentation/pages/CategoryPage.tsx](/src/presentation/pages/CategoryPage.tsx) | TypeScript JSX | 114 | 5 | 15 | 134 |
| [src/presentation/pages/ContactPage.tsx](/src/presentation/pages/ContactPage.tsx) | TypeScript JSX | 317 | 9 | 23 | 349 |
| [src/presentation/pages/FAQPage.tsx](/src/presentation/pages/FAQPage.tsx) | TypeScript JSX | 72 | 1 | 3 | 76 |
| [src/presentation/pages/FavoritePage.tsx](/src/presentation/pages/FavoritePage.tsx) | TypeScript JSX | 242 | 19 | 22 | 283 |
| [src/presentation/pages/ForgotPasswordPage.tsx](/src/presentation/pages/ForgotPasswordPage.tsx) | TypeScript JSX | 308 | 17 | 34 | 359 |
| [src/presentation/pages/HomePage.tsx](/src/presentation/pages/HomePage.tsx) | TypeScript JSX | 311 | 7 | 18 | 336 |
| [src/presentation/pages/LoginPage.tsx](/src/presentation/pages/LoginPage.tsx) | TypeScript JSX | 193 | 10 | 23 | 226 |
| [src/presentation/pages/NotFoundPage.tsx](/src/presentation/pages/NotFoundPage.tsx) | TypeScript JSX | 32 | 0 | 2 | 34 |
| [src/presentation/pages/ProductItemPage.tsx](/src/presentation/pages/ProductItemPage.tsx) | TypeScript JSX | 410 | 19 | 28 | 457 |
| [src/presentation/pages/ProductPage.tsx](/src/presentation/pages/ProductPage.tsx) | TypeScript JSX | 377 | 34 | 53 | 464 |
| [src/presentation/pages/RegisterPage.tsx](/src/presentation/pages/RegisterPage.tsx) | TypeScript JSX | 268 | 13 | 31 | 312 |
| [src/presentation/pages/ResetPasswordPage.tsx](/src/presentation/pages/ResetPasswordPage.tsx) | TypeScript JSX | 209 | 25 | 25 | 259 |
| [src/presentation/pages/UserProfilePage.tsx](/src/presentation/pages/UserProfilePage.tsx) | TypeScript JSX | 106 | 17 | 15 | 138 |
| [src/presentation/pages/admin/AdminCategoriesPage.tsx](/src/presentation/pages/admin/AdminCategoriesPage.tsx) | TypeScript JSX | 568 | 28 | 29 | 625 |
| [src/presentation/pages/admin/AdminDashboard.tsx](/src/presentation/pages/admin/AdminDashboard.tsx) | TypeScript JSX | 436 | 15 | 17 | 468 |
| [src/presentation/pages/admin/AdminOrdersPage.tsx](/src/presentation/pages/admin/AdminOrdersPage.tsx) | TypeScript JSX | 965 | 34 | 38 | 1,037 |
| [src/presentation/pages/admin/AdminProductsPage.tsx](/src/presentation/pages/admin/AdminProductsPage.tsx) | TypeScript JSX | 629 | 24 | 31 | 684 |
| [src/presentation/pages/admin/AdminRatingsPage.tsx](/src/presentation/pages/admin/AdminRatingsPage.tsx) | TypeScript JSX | 963 | 21 | 37 | 1,021 |
| [src/presentation/pages/admin/AdminSellersPage.tsx](/src/presentation/pages/admin/AdminSellersPage.tsx) | TypeScript JSX | 592 | 25 | 30 | 647 |
| [src/presentation/pages/admin/AdminShippingPage.tsx](/src/presentation/pages/admin/AdminShippingPage.tsx) | TypeScript JSX | 1,311 | 41 | 46 | 1,398 |
| [src/presentation/pages/admin/AdminUsersPage.tsx](/src/presentation/pages/admin/AdminUsersPage.tsx) | TypeScript JSX | 363 | 16 | 18 | 397 |
| [src/presentation/pages/seller/SellerDashboard.tsx](/src/presentation/pages/seller/SellerDashboard.tsx) | TypeScript JSX | 372 | 15 | 14 | 401 |
| [src/presentation/pages/seller/SellerProductCreatePage.tsx](/src/presentation/pages/seller/SellerProductCreatePage.tsx) | TypeScript JSX | 354 | 26 | 32 | 412 |
| [src/presentation/pages/seller/SellerProductsPage.tsx](/src/presentation/pages/seller/SellerProductsPage.tsx) | TypeScript JSX | 376 | 13 | 18 | 407 |
| [src/presentation/types/ProductFilterParams.ts](/src/presentation/types/ProductFilterParams.ts) | TypeScript | 7 | 17 | 5 | 29 |
| [src/routes/AdminRoute.tsx](/src/routes/AdminRoute.tsx) | TypeScript JSX | 56 | 12 | 11 | 79 |
| [src/routes/AppRoute.tsx](/src/routes/AppRoute.tsx) | TypeScript JSX | 256 | 141 | 12 | 409 |
| [src/routes/AuthRoute.tsx](/src/routes/AuthRoute.tsx) | TypeScript JSX | 21 | 7 | 7 | 35 |
| [src/routes/PrivateRoute.tsx](/src/routes/PrivateRoute.tsx) | TypeScript JSX | 26 | 5 | 5 | 36 |
| [src/routes/PublicRoute.tsx](/src/routes/PublicRoute.tsx) | TypeScript JSX | 8 | 6 | 4 | 18 |
| [src/routes/SellerRoute.tsx](/src/routes/SellerRoute.tsx) | TypeScript JSX | 56 | 12 | 12 | 80 |
| [src/styles/dark-mode.css](/src/styles/dark-mode.css) | CSS | 370 | 51 | 96 | 517 |
| [src/styles/main.css](/src/styles/main.css) | CSS | 70 | 4 | 18 | 92 |
| [src/styles/tailwind.css](/src/styles/tailwind.css) | CSS | 53 | 8 | 15 | 76 |
| [src/utils/apiHealthCheck.ts](/src/utils/apiHealthCheck.ts) | TypeScript | 203 | 23 | 25 | 251 |
| [src/utils/apiResponseInspector.ts](/src/utils/apiResponseInspector.ts) | TypeScript | 118 | 26 | 29 | 173 |
| [src/utils/categoryUtils.ts](/src/utils/categoryUtils.ts) | TypeScript | 31 | 14 | 6 | 51 |
| [src/utils/formatters/currencyFormatter.ts](/src/utils/formatters/currencyFormatter.ts) | TypeScript | 0 | 0 | 1 | 1 |
| [src/utils/formatters/dateFormatter.ts](/src/utils/formatters/dateFormatter.ts) | TypeScript | 0 | 0 | 1 | 1 |
| [src/utils/helpers.ts](/src/utils/helpers.ts) | TypeScript | 0 | 0 | 1 | 1 |
| [src/utils/productAdapter.ts](/src/utils/productAdapter.ts) | TypeScript | 93 | 16 | 12 | 121 |
| [src/utils/validators/formValidation.ts](/src/utils/validators/formValidation.ts) | TypeScript | 0 | 0 | 1 | 1 |
| [tailwind-darkmode-plugin.js](/tailwind-darkmode-plugin.js) | JavaScript | 9 | 0 | 3 | 12 |
| [tailwind.config.js](/tailwind.config.js) | JavaScript | 45 | 2 | 0 | 47 |
| [tsconfig.json](/tsconfig.json) | JSON with Comments | 39 | 4 | 1 | 44 |
| [tsconfig.node.json](/tsconfig.node.json) | JSON | 10 | 0 | 0 | 10 |
| [vite.config.ts](/vite.config.ts) | TypeScript | 24 | 0 | 2 | 26 |

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)