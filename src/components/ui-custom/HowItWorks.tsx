
import React from 'react';
import { MapPin, BookOpen, Users, MessageCircle } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: "List Your Books",
    description: "Add books from your shelf that you're willing to share with others.",
    icon: <BookOpen className="w-8 h-8 text-book-accent" />,
  },
  {
    id: 2,
    title: "Discover Nearby",
    description: "Find books available for trade in your neighborhood with geofencing.",
    icon: <MapPin className="w-8 h-8 text-book-accent" />,
  },
  {
    id: 3,
    title: "Connect & Request",
    description: "Send a request when you find a book you'd like to read.",
    icon: <Users className="w-8 h-8 text-book-accent" />,
  },
  {
    id: 4,
    title: "Arrange Exchange",
    description: "Chat to arrange a convenient time and place to exchange books.",
    icon: <MessageCircle className="w-8 h-8 text-book-accent" />,
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-book-paper">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">How BookCircuit Works</h2>
          <p className="text-book-dark/70 text-lg">
            Join our community and start trading books in four simple steps
          </p>
        </div>
        
        <div className="relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-book-accent/10 via-book-accent/50 to-book-accent/10 transform -translate-y-1/2" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <div key={step.id} className="relative" style={{ animationDelay: `${index * 0.1 + 0.2}s` }}>
                <div className="text-center">
                  <div className="relative z-10 w-20 h-20 mx-auto bg-white rounded-full shadow-md border border-book-accent/10 flex items-center justify-center mb-6">
                    <div className="absolute inset-0 bg-book-accent/5 rounded-full animate-blob" style={{ animationDelay: `${index * 0.5}s` }}></div>
                    {step.icon}
                  </div>
                  
                  <div className="py-4">
                    <h3 className="text-xl font-semibold font-serif mb-2">{step.title}</h3>
                    <p className="text-book-dark/70">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
