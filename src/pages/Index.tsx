import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/ui-custom/Navbar';
import Hero from '@/components/ui-custom/Hero';
import FeatureCard from '@/components/ui-custom/FeatureCard';
import HowItWorks from '@/components/ui-custom/HowItWorks';
import Footer from '@/components/ui-custom/Footer';
import Button from '@/components/ui-custom/Button';
import FeaturedBlogPosts from '@/components/ui-custom/FeaturedBlogPosts';
import { BookOpen, MapPin, Users, MessageCircle, Bell, Search, ShieldCheck } from 'lucide-react';

const Index = () => {
  // Smooth scroll for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const id = target.getAttribute('href')?.substring(1);
        const element = document.getElementById(id as string);
        if (element) {
          window.scrollTo({
            top: element.offsetTop - 80,
            behavior: 'smooth',
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">Features Built for Book Lovers</h2>
            <p className="text-book-dark/70 text-lg">
              Discover all the ways BookCircuit makes book trading simple, secure, and social
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="Book Catalog Management"
              description="Easily add, organize, and manage your collection. Keep track of books you own and want to read."
              icon={<BookOpen className="w-6 h-6 text-book-accent" />}
            />
            <FeatureCard
              title="Geolocation & Geofencing"
              description="Discover books nearby with precise location features. Set your preferred radius for finding trades."
              icon={<MapPin className="w-6 h-6 text-book-accent" />}
            />
            <FeatureCard
              title="User Profiles & Authentication"
              description="Create your unique reader profile and connect with like-minded book enthusiasts in your community."
              icon={<Users className="w-6 h-6 text-book-accent" />}
            />
            <FeatureCard
              title="In-App Messaging"
              description="Communicate directly with other readers to arrange book exchanges at your convenience."
              icon={<MessageCircle className="w-6 h-6 text-book-accent" />}
            />
            <FeatureCard
              title="Smart Notifications"
              description="Stay informed about requests, messages, and nearby book availability with real-time alerts."
              icon={<Bell className="w-6 h-6 text-book-accent" />}
            />
            <FeatureCard
              title="Advanced Search & Filtering"
              description="Find exactly what you're looking for with filters for genre, author, condition, and distance."
              icon={<Search className="w-6 h-6 text-book-accent" />}
            />
          </div>
        </div>
      </section>
      
      {/* How it Works Section */}
      <HowItWorks />
      
      {/* Testimonial/Stats Section */}
      <section className="py-20 bg-gradient-to-br from-book-accent/5 to-purple-400/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">Join a Growing Community</h2>
            <p className="text-book-dark/70 text-lg">
              Thousands of book lovers are already trading and connecting
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="glass-card rounded-2xl p-8 text-center">
              <div className="text-4xl font-bold font-serif text-book-accent mb-2">10,000+</div>
              <p className="text-book-dark/70">Active Users</p>
            </div>
            <div className="glass-card rounded-2xl p-8 text-center">
              <div className="text-4xl font-bold font-serif text-book-accent mb-2">50,000+</div>
              <p className="text-book-dark/70">Books Traded</p>
            </div>
            <div className="glass-card rounded-2xl p-8 text-center">
              <div className="text-4xl font-bold font-serif text-book-accent mb-2">500+</div>
              <p className="text-book-dark/70">Cities</p>
            </div>
          </div>
          
          <div className="glass-card rounded-2xl p-8 md:p-10 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120&q=80"
                  alt="Sarah J."
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-lg md:text-xl italic text-book-dark/80 mb-4">
                  "BookCircuit has transformed how I read. I've discovered amazing books from people in my neighborhood and made friends who share my taste in literature. It's like having a community library right at my fingertips!"
                </p>
                <div>
                  <h4 className="font-medium">Sarah J.</h4>
                  <p className="text-book-dark/60 text-sm">Book lover from Portland</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-book-paper">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">Frequently Asked Questions</h2>
            <p className="text-book-dark/70 text-lg">
              Everything you need to know about BookCircuit
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto grid gap-6">
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-xl font-semibold font-serif mb-3">Is BookCircuit free to use?</h3>
              <p className="text-book-dark/70">
                Yes, BookCircuit is completely free to use for finding, listing, and trading books with people in your area.
              </p>
            </div>
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-xl font-semibold font-serif mb-3">How does the location feature work?</h3>
              <p className="text-book-dark/70">
                BookCircuit uses geofencing to show you books available within your preferred radius. You can set this distance in your profile settings.
              </p>
            </div>
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-xl font-semibold font-serif mb-3">Is my personal information secure?</h3>
              <p className="text-book-dark/70">
                We take privacy seriously. Your exact location is never shared with other users, only the general area. Personal details are only revealed when you choose to connect with another user.
              </p>
            </div>
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-xl font-semibold font-serif mb-3">What if I can't find the book I'm looking for?</h3>
              <p className="text-book-dark/70">
                You can add books to your "Wanted" list, and you'll be notified when someone in your area adds that book to their collection.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-book-accent to-purple-500 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-6">Ready to Start Trading Books?</h2>
            <p className="text-white/90 text-lg mb-8 md:mb-10">
              Join thousands of readers exchanging books and stories in your community. Get started today — it's free!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/get-started">
                <Button 
                  size="lg" 
                  variant="primary"
                  className="bg-white text-book-accent border-2 border-white hover:bg-transparent hover:text-white transition-colors duration-300"
                >
                  Create Your Account
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-book-accent transition-colors duration-300"
                >
                  Learn More
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
      
      {/* Security Badge Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-book-dark/60">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>SSL Secured</span>
            </div>
            <div className="hidden md:block w-1 h-1 rounded-full bg-book-dark/20"></div>
            <div>Privacy Protected</div>
            <div className="hidden md:block w-1 h-1 rounded-full bg-book-dark/20"></div>
            <div>©2023 BookCircuit Inc.</div>
          </div>
        </div>
      </section>
      
      {/* Featured Blog Posts */}
      <FeaturedBlogPosts />
      
      <Footer />
    </div>
  );
};

export default Index;
