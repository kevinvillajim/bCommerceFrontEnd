import React from 'react';
import FAQBase from '../components/FAQ/FAQBase';

const FAQExample: React.FC = () => {
  // Datos de ejemplo para las FAQs
  const faqData = [
    {
      id: 1,
      question: "¿Cuál es el plazo de entrega de los productos?",
      answer: "Nuestros plazos de entrega varían según la ubicación. Para áreas urbanas, generalmente entregamos en 1-3 días hábiles. Para zonas rurales, puede tomar de 3-5 días hábiles. Puedes verificar el tiempo estimado de entrega específico para tu área durante el proceso de compra.",
      category: "Envíos"
    },
    {
      id: 2,
      question: "¿Cómo puedo rastrear mi pedido?",
      answer: "Una vez que tu pedido haya sido enviado, recibirás un correo electrónico con un número de seguimiento y un enlace para rastrear tu pedido. También puedes iniciar sesión en tu cuenta y ver el estado de tu pedido en la sección 'Mis pedidos'.",
      category: "Envíos"
    },
    {
      id: 3,
      question: "¿Cuál es la política de devoluciones?",
      answer: "Aceptamos devoluciones de productos en su estado original dentro de los 30 días posteriores a la recepción. Para iniciar una devolución, dirígete a la sección 'Mis pedidos' en tu cuenta o contáctanos a través de nuestro formulario de contacto. Recuerda que algunos productos como artículos personalizados no son elegibles para devolución.",
      category: "Devoluciones"
    },
    {
      id: 4,
      question: "¿Los precios incluyen impuestos?",
      answer: "Sí, todos los precios mostrados en nuestra tienda incluyen IVA. En el resumen de tu compra podrás ver el desglose de los impuestos aplicados.",
      category: "Pagos"
    },
    {
      id: 5,
      question: "¿Qué métodos de pago aceptan?",
      answer: "Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), PayPal, transferencia bancaria y pago contra entrega en algunas zonas seleccionadas.",
      category: "Pagos"
    },
    {
      id: 6,
      question: "¿Ofrecen envío internacional?",
      answer: "Sí, enviamos a más de 50 países. Los gastos de envío y tiempos de entrega varían según el destino. Puedes verificar si enviamos a tu país durante el proceso de compra.",
      category: "Envíos"
    },
    {
      id: 7,
      question: "¿Cómo puedo cambiar o cancelar mi pedido?",
      answer: "Puedes solicitar cambios o cancelaciones de pedidos dentro de las primeras 2 horas después de realizar la compra. Contacta a nuestro servicio al cliente lo antes posible. Una vez que el pedido entra en proceso de preparación, no podremos realizar cambios.",
      category: "Pedidos"
    },
    {
      id: 8,
      question: "¿Tienen garantía los productos?",
      answer: "Todos nuestros productos tienen una garantía mínima de 1 año que cubre defectos de fabricación. Algunos productos premium tienen garantías extendidas de hasta 3 años. La información específica de la garantía se indica en la descripción de cada producto.",
      category: "Productos"
    },
    {
      id: 9,
      question: "¿Puedo modificar mi información de cuenta?",
      answer: "Sí, puedes modificar tu información personal, dirección de envío y preferencias de pago en cualquier momento desde la sección 'Mi cuenta' después de iniciar sesión.",
      category: "Cuenta"
    },
    {
      id: 10,
      question: "¿Ofrecen descuentos para compras al por mayor?",
      answer: "Sí, ofrecemos precios especiales para compras al por mayor o corporativas. Para obtener más información, ponte en contacto con nuestro equipo de ventas a través del formulario de contacto especificando tus necesidades.",
      category: "Ventas"
    }
  ];

  return (
    <div className="container mx-auto">
      <FAQBase faqs={faqData} colorScheme="primary" />
    </div>
  );
};

export default FAQExample;