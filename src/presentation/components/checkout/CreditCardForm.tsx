// src/presentation/components/checkout/CreditCardForm.tsx
import React from "react";

interface CreditCardFormProps {
	content: React.ReactNode;
}

const CreditCardForm: React.FC<CreditCardFormProps> = ({content}) => {
	const deunaInitiated = false; // Simulación de estado, reemplazar con lógica real
	return (
		<div className="space-y-4">
			<div className="text-center">
      <p className="mb-4 text-gray-600">
        Paga con Datafast!, ingresa los datos personales para pagar
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
              className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Información sobre DeUna */}
          <div className="bg-[linear-gradient(to_right,_rgba(0,184,110,1)_0%,_rgba(0,77,112,1)_46%,_rgba(0,77,112,1)_100%)] border-purple-200 rounded-lg p-6">
            <div className="flex items-center justify-center mb-4 h-50">
              <img
                src="https://www.datafast.com.ec/images/logo.png"
                alt="DeUna Logo"
                className="h-20"
              />
            </div>
          </div>

          {content}
        </div>
      )}
      <div className="mt-4 text-sm text-gray-500">
        <p>
          <strong>1.</strong> Haz clic en "Pagar con Datafast!"
        </p>
        <p>
          <strong>2.</strong> Completa los datos de tu tarjeta de crédito o débito.
        </p>
        <p>
          <strong>3.</strong> Confirma tu compra al finalizar.
        </p>
      </div>
    </div>
		</div>
	);
};

export default CreditCardForm;
