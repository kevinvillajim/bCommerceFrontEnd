import React from 'react';


interface Feature {
  title: string;
  description: string;
  icon: React.ElementType;
  color?: string;
}

interface WhyUsProps {
  title?: string;
  features?: Feature[];
}

const WhyUs: React.FC<WhyUsProps> = ({ 
  title,
  features = []
}) => {
  return (
    <section className="mb-12 py-8">
      <h2 className="text-2xl font-bold mb-8 text-center">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="bg-white shadow-md hover:shadow-lg rounded-xl p-6 transition-all duration-300 hover:translate-y-[-5px]"
          >
            <div className={`w-14 h-14 ${feature.color || 'bg-indigo-50 text-indigo-600'} rounded-full flex items-center justify-center mb-4`}>
              <feature.icon size={28} strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-lg mb-3 text-gray-800">{feature.title}</h3>
            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyUs;