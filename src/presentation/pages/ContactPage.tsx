import { useState, useEffect } from 'react';
import { 
  Mail, Phone, MapPin, Clock, MessageSquare, 
  Send, CheckCircle, Loader2
} from 'lucide-react';

const ContactPage = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [formStatus, setFormStatus] = useState('idle'); // 'idle', 'submitting', 'success', 'error'
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setFormStatus('submitting');
  
  // Simulación de envío del formulario
  setTimeout(() => {
    setFormStatus('success');
    // Resetear el formulario después de 3 segundos
    setTimeout(() => {
      setFormStatus('idle');
      setFormValues({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 3000);
  }, 1500);
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;
  setFormValues(prev => ({
    ...prev,
    [name]: value
  }));
};

  const contactInfo = [
    {
      icon: <Phone size={24} />,
      title: "Llámanos",
      details: [
        "+593 96 296 6301",
        "+1 (123) 456-7891"
      ]
    },
    {
      icon: <Mail size={24} />,
      title: "Escríbenos",
      details: [
        "info@comersia.com",
        "soporte@comersia.com"
      ]
    },
    {
      icon: <MapPin size={24} />,
      title: "Visítanos",
      details: [
        "Gil R.Dávalos y Av.Amazonas", 
        "Edificio Centro Amazonas ",
        "#402 Quito, Ecuador"
      ]
    },
    {
      icon: <Clock size={24} />,
      title: "Horario",
      details: [
        "Lun - Vie: 9am - 6pm",
        "Sáb: 10am - 2pm"
      ]
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-black to-primary-700 opacity-90" />
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: "url('https://via.placeholder.com/1920x1080')",
            opacity: 0.2
          }}
        />
        
        <div className="relative container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Contacta con Nosotros</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
            Estamos aquí para ayudarte. No dudes en ponerte en contacto con nosotros para cualquier consulta o información adicional.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {contactInfo.map((info, index) => (
              <div 
                key={index} 
                className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white border border-white/20 hover:bg-white/20 transition-all"
                style={{
                  opacity: scrollPosition > 0 ? 1 : 0,
                  transform: scrollPosition > 0 ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity 0.6s ease, transform 0.6s ease',
                  transitionDelay: `${index * 0.1}s`
                }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-full mb-4 text-white">
                  {info.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{info.title}</h3>
                {info.details.map((detail, i) => (
                  <p key={i} className="text-white/80">{detail}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Contact Form & Map Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Form */}
            <div className="p-8 lg:p-12" style={{
              opacity: scrollPosition > 300 ? 1 : 0,
              transform: scrollPosition > 300 ? 'translateX(0)' : 'translateX(-30px)',
              transition: 'opacity 0.8s ease, transform 0.8s ease'
            }}>
              <div className="space-y-4 mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Envíanos un mensaje</h2>
                <p className="text-gray-600">
                  Completa el formulario y nos pondremos en contacto contigo lo antes posible.
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formValues.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Tu nombre"
                    disabled={formStatus !== 'idle'}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formValues.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="tu@email.com"
                    disabled={formStatus !== 'idle'}
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Asunto
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formValues.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="¿En qué podemos ayudarte?"
                    disabled={formStatus !== 'idle'}
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formValues.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Describe tu consulta en detalle..."
                    disabled={formStatus !== 'idle'}
                  />
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={formStatus !== 'idle'}
                    className={`w-full py-3 px-6 rounded-lg flex items-center justify-center font-medium transition-colors ${
                      formStatus === 'success' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    }`}
                  >
                    {formStatus === 'idle' && (
                      <>
                        <Send size={18} className="mr-2" />
                        Enviar mensaje
                      </>
                    )}
                    {formStatus === 'submitting' && (
                      <>
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        Enviando...
                      </>
                    )}
                    {formStatus === 'success' && (
                      <>
                        <CheckCircle size={18} className="mr-2" />
                        ¡Mensaje enviado!
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Map */}
            <div
              className="bg-gray-100 relative overflow-hidden" // Asegura que no haya desbordamiento visual
              style={{
                opacity: scrollPosition > 300 ? 1 : 0,
                transform: scrollPosition > 300 ? "translateX(0)" : "translateX(30px)",
                transition: "opacity 0.8s ease, transform 0.8s ease",
              }}
            >
              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                {/* Mapa de Ubicación */}
                <div className="hidden md:block text-center p-6 w-full">
                  <MapPin size={48} className="mx-auto mb-6 text-primary-600" />          
                  {/* Contenedor Responsivo del Mapa */}
                  <div className="w-full max-w-4xl mx-auto h-[450px] rounded-lg overflow-hidden shadow-lg">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.793325639139!2d-78.49723522547215!3d-0.20280809979519304!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d59be0b4d050bb%3A0x9f2fea910a6d3edf!2sBusiness%20Connect!5e0!3m2!1ses!2sec!4v1743142123192!5m2!1ses!2sec"
                      className="w-full h-full border-0"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Preguntas Frecuentes</h2>
            <p className="text-gray-600">
              Respuestas a las consultas más comunes de nuestros clientes
            </p>
          </div>
          
          <div className="space-y-6">
            {[
              {
                q: "¿Cuál es el tiempo de entrega de los productos?",
                a: "Generalmente, nuestros productos se entregan en un plazo de 2-5 días hábiles, dependiendo de tu ubicación. Para áreas metropolitanas, ofrecemos entrega en 24-48 horas."
              },
              {
                q: "¿Ofrecen garantía en todos los productos?",
                a: "Sí, todos nuestros productos vienen con garantía del fabricante. Además, ofrecemos una garantía de satisfacción de 30 días en la mayoría de los artículos."
              },
              {
                q: "¿Cómo puedo realizar el seguimiento de mi pedido?",
                a: "Una vez que tu pedido es procesado, recibirás un correo electrónico con un número de seguimiento que te permitirá rastrear tu paquete en tiempo real a través de nuestra plataforma o la del transportista."
              },
            ].map((faq, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-md p-6"
                style={{
                  opacity: scrollPosition > 600 ? 1 : 0,
                  transform: scrollPosition > 600 ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity 0.6s ease, transform 0.6s ease',
                  transitionDelay: `${index * 0.1}s`
                }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-start">
                  <MessageSquare size={20} className="text-primary-600 mr-2 flex-shrink-0 mt-1" />
                  {faq.q}
                </h3>
                <p className="text-gray-600 ml-7">{faq.a}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <a href="faq" className="text-primary-600 hover:text-primary-800 font-medium">
              Ver todas las preguntas frecuentes →
            </a>
          </div>
        </div>
      </div>
      
      <style>
        {`
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
            100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
          }
        `}
      </style>
    </div>
  );
};

export default ContactPage;