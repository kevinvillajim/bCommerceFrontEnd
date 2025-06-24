// src/presentation/components/checkout/QRPaymentForm.tsx
// ✅ CAMBIAR A "PAGO CON DEUNA!"
import React, { useState } from "react";
import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../../utils/formatters/formatCurrency";

const QRPaymentForm: React.FC = () => {
  const [deunaInitiated, setDeunaInitiated] = useState(false);
  const { cart } = useCart();

  // Calcular el total para mostrar
  const total = cart?.total || 0;

  return (
    <div className="text-center">
      <p className="mb-4 text-gray-600">
        Paga con DeUna!, Genera el código qr y escanealo desde tu app para pagar
        de forma rápida y segura.
      </p>

      {deunaInitiated ? (
        <div className="mb-4 mx-auto">
          <div className="bg-gradient-to-r from-[#2fd8a8] to-[#4d1d81] p-6 rounded-lg text-white">
            {/* Logo de DeUna placeholder */}
            <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
              <div className="text-2xl font-bold text-purple-600">DeUna!</div>
            </div>

            <h3 className="text-xl font-bold mb-2">Pago con DeUna!</h3>
            <p className="text-purple-100 mb-4">
              Monto a pagar: {formatCurrency(total)}
            </p>

            <div className="bg-white/20 rounded-lg p-4 mb-4">
              <div className="animate-pulse">
                <div className="text-sm text-purple-100">
                  Conectando con DeUna!...
                </div>
                <div className="w-full bg-white/30 rounded-full h-2 mt-2">
                  <div className="bg-white h-2 rounded-full w-3/4 animate-pulse"></div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setDeunaInitiated(false)}
              className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Información sobre DeUna */}
          <div className="bg-[rgba(47,216,168)] border-purple-200 rounded-lg p-6">
            <div className="flex items-center justify-center mb-4">
              <img
                src="https://deuna.app/assets/img/brand/logo-deuna.svg"
                alt="DeUna Logo"
                className="w-50 h-50"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDeunaInitiated(true)}
            className="w-full bg-[#3f2b57] hover:bg-[#342843] text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-101 flex items-center justify-center"
          >
            Pagar con DeUna! - {formatCurrency(total)}
          </button>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        <p>
          <strong>1.</strong> Haz clic en "Pagar con DeUna!"
        </p>
        <p>
          <strong>2.</strong> Completa el pago con el QR
        </p>
        <p>
          <strong>3.</strong> Confirma tu compra al finalizar.
        </p>
      </div>
    </div>
  );
};

export default QRPaymentForm;
