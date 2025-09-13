// src/presentation/hooks/useChatFilter.ts
import { useToast } from '../components/UniversalToast';
import { NotificationType } from '../types/NotificationTypes';

export const useChatFilter = () => {
  const { showToast } = useToast();

  const showUserWarning = (message: string, censoredContent?: string) => {
    let fullMessage = message;
    if (censoredContent) {
      fullMessage += `\n\nMensaje filtrado: "${censoredContent}"`;
    }

    showToast(NotificationType.WARNING, fullMessage, {
      duration: 8000,
      position: 'top-right'
    });
  };

  const showSellerStrike = (message: string, strikeCount: number, censoredContent?: string) => {
    let fullMessage = message;
    if (censoredContent) {
      fullMessage += `\n\nMensaje filtrado: "${censoredContent}"`;
    }
    fullMessage += `\n\nStrikes: ${strikeCount}/3`;

    if (strikeCount >= 3) {
      fullMessage += "\nTu cuenta ha sido bloqueada por acumular 3 strikes.";
    }

    showToast(NotificationType.ERROR, fullMessage, {
      duration: 10000,
      position: 'top-right',
      persistent: strikeCount >= 3
    });
  };

  const showSellerBlocked = (message: string) => {
    showToast(NotificationType.ERROR, message, {
      persistent: true,
      position: 'top-right'
    });
  };

  return {
    showUserWarning,
    showSellerStrike,
    showSellerBlocked
  };
};