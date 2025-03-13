
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      
      const { clientX, clientY } = e;
      const { left, top, width, height } = heroRef.current.getBoundingClientRect();
      
      const x = (clientX - left) / width;
      const y = (clientY - top) / height;
      
      const moveX = 20 - x * 40;
      const moveY = 10 - y * 20;
      
      const blur1 = document.querySelector('.hero-blur-1') as HTMLElement;
      const blur2 = document.querySelector('.hero-blur-2') as HTMLElement;
      
      if (blur1 && blur2) {
        blur1.style.transform = `translate(${moveX * 0.5}px, ${moveY * 0.5}px)`;
        blur2.style.transform = `translate(${-moveX * 0.3}px, ${-moveY * 0.3}px)`;
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={heroRef} className="relative min-h-screen overflow-hidden hero-gradient">
      {/* Decorative blurred circles */}
      <div className="absolute pointer-events-none">
        <div className="hero-blur-1 absolute top-1/4 -left-24 w-96 h-96 bg-book-accent/20 rounded-full filter blur-3xl opacity-60 transition-transform duration-700"></div>
        <div className="hero-blur-2 absolute bottom-1/4 -right-24 w-96 h-96 bg-purple-400/20 rounded-full filter blur-3xl opacity-60 transition-transform duration-700"></div>
      </div>
      
      {/* Hero content */}
      <div className="container mx-auto px-4 md:px-6 pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="max-w-5xl mx-auto text-center">
          <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
            <h5 className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider bg-book-accent/10 text-book-accent">
              The Local Book Trading Network
            </h5>
          </div>
          
          <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-serif tracking-tight mb-6 md:mb-8">
              Share Books, <span className="text-gradient">Connect</span> with Readers Nearby
            </h1>
          </div>
          
          <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
            <p className="text-lg md:text-xl text-book-dark/80 max-w-3xl mx-auto mb-8 md:mb-10">
              Discover a community of book lovers around you. Trade books you've read for ones you want to read, 
              build your personal library, and connect with fellow readers in your neighborhood.
            </p>
          </div>
          
          <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
              <Link to="/get-started">
                <Button size="lg" variant="primary">
                  Get Started — It's Free
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="outline">
                  Learn How It Works
                </Button>
              </a>
            </div>
          </div>
          
          <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
            <div className="glass-card p-4 md:p-8 rounded-2xl shadow-xl mx-auto max-w-4xl">
              <div className="aspect-video relative overflow-hidden rounded-lg">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800/5 to-gray-900/20">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 mx-auto bg-white/90 rounded-full flex items-center justify-center shadow-lg mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-book-accent">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </div>
                    <h4 className="text-xl font-medium text-white">App Preview</h4>
                    <p className="text-white/80 text-sm mt-2">See BookCircuit in action</p>
                  </div>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1549122728-f519709caa9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                  alt="BookCircuit App Preview" 
                  className="w-full h-full object-cover opacity-90"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
