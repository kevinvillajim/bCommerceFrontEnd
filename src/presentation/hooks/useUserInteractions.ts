import { useCallback } from "react";
import UserInteractionService from "../../infrastructure/services/UserInteractionService";
/** * Hook para registrar interacciones de usuario de manera sencilla * Encapsula la lógica del UserInteractionService */ export const useUserInteractions =
  (defaultSource: string = "unknown") => {
    const trackProductView = useCallback(
      (
        productId: number,
        source?: string,
        additionalData?: Record<string, any>
      ) => {
        UserInteractionService.trackProductView(
          productId,
          source || defaultSource,
          additionalData
        );
      },
      [defaultSource]
    );
    const trackProductClick = useCallback(
      (
        productId: number,
        source?: string,
        additionalData?: Record<string, any>
      ) => {
        UserInteractionService.trackProductClick(
          productId,
          source || defaultSource,
          additionalData
        );
      },
      [defaultSource]
    );
    const trackAddToCart = useCallback(
      (productId: number, quantity: number = 1, source?: string) => {
        UserInteractionService.trackAddToCart(
          productId,
          quantity,
          source || defaultSource
        );
      },
      [defaultSource]
    );
    const trackAddToWishlist = useCallback(
      (productId: number, source?: string) => {
        UserInteractionService.trackAddToWishlist(
          productId,
          source || defaultSource
        );
      },
      [defaultSource]
    );
    const trackRemoveFromWishlist = useCallback(
      (productId: number, source?: string) => {
        UserInteractionService.trackRemoveFromWishlist(
          productId,
          source || defaultSource
        );
      },
      [defaultSource]
    );
    const trackSearch = useCallback(
      (searchTerm: string, resultsCount?: number, source?: string) => {
        UserInteractionService.trackSearch(
          searchTerm,
          resultsCount,
          source || defaultSource
        );
      },
      [defaultSource]
    );
    const trackCategoryView = useCallback(
      (categoryId: number, categoryName: string, source?: string) => {
        UserInteractionService.trackCategoryView(
          categoryId,
          categoryName,
          source || defaultSource
        );
      },
      [defaultSource]
    );
    const trackTimeOnProduct = useCallback(
      (productId: number, timeSpentSeconds: number, source?: string) => {
        UserInteractionService.trackTimeOnProduct(
          productId,
          timeSpentSeconds,
          source || defaultSource
        );
      },
      [defaultSource]
    );
    const trackRating = useCallback(
      (productId: number, ratingValue: number, source?: string) => {
        UserInteractionService.trackRating(
          productId,
          ratingValue,
          source || defaultSource
        );
      },
      [defaultSource]
    );
    const trackPurchase = useCallback(
      (productIds: number[], totalAmount: number, orderId?: number) => {
        UserInteractionService.trackPurchase(productIds, totalAmount, orderId);
      },
      []
    );
    return {
      trackProductView,
      trackProductClick,
      trackAddToCart,
      trackAddToWishlist,
      trackRemoveFromWishlist,
      trackSearch,
      trackCategoryView,
      trackTimeOnProduct,
      trackRating,
      trackPurchase,
    };
  };
export default useUserInteractions;
