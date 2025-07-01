import React, { useEffect, useState } from 'react';
import { Users, Award, Clock, Sparkles, ChevronRight, MapPin, Phone, Mail } from 'lucide-react';


interface StatItem {
  value: number;
  label: string;
  icon: React.ReactNode;
}

interface TeamMember {
  name: string;
  position: string;
  image: string;
}

const AboutUs: React.FC = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Valores para mostrar en la página
  const stats: StatItem[] = [
    { value: 10, label: "Años de experiencia", icon: <Clock size={24} /> },
    { value: 5000, label: "Clientes satisfechos", icon: <Users size={24} /> },
    { value: 8, label: "Premios de la industria", icon: <Award size={24} /> },
    { value: 1500, label: "Productos en catálogo", icon: <Sparkles size={24} /> },
  ];

  // Equipo
  const team: TeamMember[] = [
  { 
    name: "Ana Rodriguez", 
    position: "CEO & Fundadora", 
    image: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  { 
    name: "Carlos Méndez", 
    position: "Director de Tecnología", 
    image: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  { 
    name: "Sofía Herrera", 
    position: "Directora de Ventas", 
    image: "https://randomuser.me/api/portraits/women/65.jpg"
  }
];


  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-slate-900 to-gray-800 opacity-60"
          style={{ 
            transform: `translateY(${scrollPosition * 0.3}px)`,
            transition: "transform 0.3s ease-out" 
          }}
        />
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.5)), 
                              url('https://concepto.de/wp-content/uploads/2019/08/politicas-de-una-empresa-1-scaled.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: `scale(${1 + scrollPosition * 0.0005})`,
            transition: "transform 0.3s ease-out"
          }}

        />
        <div className="relative min-h-[60vh] flex items-center justify-center px-4">
          <div className="max-w-4xl mx-auto text-center py-24" style={{ 
            opacity: 1 - scrollPosition * 0.002,
            transform: `translateY(${scrollPosition * 0.2}px)`,
            transition: "opacity 0.3s ease-out, transform 0.3s ease-out"
          }}>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Sobre Nosotros</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Somos una tienda especializada en tecnología, comprometida con ofrecer productos de alta calidad y soluciones innovadoras para nuestros clientes desde 2014.
            </p>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Misión y Visión */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="opacity-0" style={{ 
              opacity: scrollPosition > 200 ? 1 : 0,
              transform: scrollPosition > 200 ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s ease, transform 0.8s ease'
            }}>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Nuestra Misión</h2>
              <p className="text-gray-600">
                Proporcionar a nuestros clientes los mejores productos tecnológicos, respaldados por un servicio excepcional y asesoramiento experto, facilitando el acceso a la innovación para mejorar su vida digital.
              </p>
            </div>
            
            <div className="opacity-0" style={{ 
              opacity: scrollPosition > 300 ? 1 : 0,
              transform: scrollPosition > 300 ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s ease, transform 0.8s ease',
              transitionDelay: '0.2s'
            }}>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Nuestra Visión</h2>
              <p className="text-gray-600">
                Ser la referencia indiscutible en el mercado de tecnología, reconocidos por nuestra capacidad de anticipar las necesidades del cliente y ofrecer soluciones tecnológicas que marquen tendencia.
              </p>
            </div>
            
            <div className="opacity-0" style={{ 
              opacity: scrollPosition > 400 ? 1 : 0,
              transform: scrollPosition > 400 ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s ease, transform 0.8s ease',
              transitionDelay: '0.4s'
            }}>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Nuestros Valores</h2>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-start">
                  <ChevronRight className="text-primary-600 mt-1 mr-2 flex-shrink-0" size={16} />
                  <span>Innovación constante en nuestro catálogo y servicios</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="text-primary-600 mt-1 mr-2 flex-shrink-0" size={16} />
                  <span>Integridad y transparencia en todas nuestras operaciones</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="text-primary-600 mt-1 mr-2 flex-shrink-0" size={16} />
                  <span>Compromiso con la calidad y satisfacción del cliente</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="relative" style={{ 
            opacity: scrollPosition > 250 ? 1 : 0,
            transform: scrollPosition > 250 ? 'translateX(0)' : 'translateX(50px)',
            transition: 'opacity 0.8s ease, transform 0.8s ease'
          }}>
            <div className="relative z-10 rounded-lg overflow-hidden shadow-xl">
              <img 
                src="https://www.internacionalweb.com/noticias_fotos/internacionalweb-empleo_g1.jpg" 
                alt="Nuestro equipo" 
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="absolute -top-4 -right-4 w-64 h-64 bg-primary-100 rounded-full opacity-50 z-0" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-cyan-100 rounded-full opacity-50 z-0" />
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">Nuestra Trayectoria</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Construyendo confianza y experiencia a lo largo de los años
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center" style={{ 
                opacity: scrollPosition > 700 ? 1 : 0,
                transform: scrollPosition > 700 ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.8s ease, transform 0.8s ease`,
                transitionDelay: `${index * 0.1}s`
              }}>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4 text-primary-400">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold text-white mb-1">
                  {stat.value.toLocaleString()}+
                </div>
                <p className="text-slate-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Nuestro Equipo</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Personas apasionadas que trabajan juntas para brindarte la mejor experiencia tecnológica
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {team.map((member, index) => (
              <div key={index} className="text-center" style={{ 
                opacity: scrollPosition > 1000 ? 1 : 0,
                transform: scrollPosition > 1000 ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.8s ease, transform 0.8s ease',
                transitionDelay: `${index * 0.2}s`
              }}>
                <div className="relative mx-auto w-40 h-40 mb-6 overflow-hidden rounded-full border-4 border-white shadow-md transform transition-transform hover:scale-105">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-primary-600">{member.position}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Contáctanos</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              ¿Tienes alguna pregunta? Estamos aquí para ayudarte.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors" style={{ 
              opacity: scrollPosition > 1300 ? 1 : 0,
              transition: 'opacity 0.8s ease',
              transitionDelay: '0s'
            }}>
              <MapPin size={32} className="text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Dirección</h3>
              <p className="text-gray-600 text-center">Gil R. Dávalos y Av. Amazonas - Edificio Centro Amazonas - #402 Quito, Ecuador</p>
            </div>
            
            <div className="flex flex-col items-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors" style={{ 
              opacity: scrollPosition > 1300 ? 1 : 0,
              transition: 'opacity 0.8s ease',
              transitionDelay: '0.2s'
            }}>
              <Phone size={32} className="text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Teléfono</h3>
              <p className="text-gray-600 text-center">+593 96 296 6301</p>
              <p className="text-gray-600 text-center">Lun - Vie: 9am - 6pm</p>
            </div>
            
            <div className="flex flex-col items-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors" style={{ 
              opacity: scrollPosition > 1300 ? 1 : 0,
              transition: 'opacity 0.8s ease',
              transitionDelay: '0.4s'
            }}>
              <Mail size={32} className="text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600 text-center">info@comersia.com</p>
              <p className="text-gray-600 text-center">soporte@comersia.com</p>
            </div>
          </div>
        </div>
      </section>

      <style>
        {`
          @keyframes fadeUp {
            from { 
              opacity: 0;
              transform: translateY(30px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default AboutUs;