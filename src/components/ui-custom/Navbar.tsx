import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import Button from './Button';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const navigateToProfile = () => {
    navigate('/profile');
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-3 bg-white/80 backdrop-blur-lg shadow-sm' : 'py-5 bg-transparent'
      }`}
    >
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl md:text-2xl font-bold font-serif text-book-dark">BookCircuit</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {!user ? (
              <>
                <a href="#features" className="text-book-dark/80 hover:text-book-accent transition-colors">
                  Features
                </a>
                <a href="#how-it-works" className="text-book-dark/80 hover:text-book-accent transition-colors">
                  How It Works
                </a>
                <a href="#faq" className="text-book-dark/80 hover:text-book-accent transition-colors">
                  FAQ
                </a>
                <Link to="/blog" className="text-book-dark/80 hover:text-book-accent transition-colors">
                  Blog
                </Link>
              </>
            ) : (
              <>
                <Link to="/home" className="text-book-dark/80 hover:text-book-accent transition-colors">
                  Home
                </Link>
                <Link to="/dashboard" className="text-book-dark/80 hover:text-book-accent transition-colors">
                  Dashboard
                </Link>
                <Link to="/blog" className="text-book-dark/80 hover:text-book-accent transition-colors">
                  Blog
                </Link>
              </>
            )}
          </nav>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div 
                  className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={navigateToProfile}
                >
                  <div className="w-8 h-8 bg-book-accent/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-book-accent" />
                  </div>
                  <span className="text-sm text-book-dark/70 hidden lg:inline-block">
                    {user.email?.split('@')[0]}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/signin">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/get-started">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-book-dark" />
            ) : (
              <Menu className="h-6 w-6 text-book-dark" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`fixed inset-0 bg-white z-50 transform ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
        <div className="flex flex-col h-full p-4">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
                <span className="text-xl font-bold font-serif text-book-dark">BookCircuit</span>
              </Link>
            </div>
            <button
              className="p-2 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          <nav className="flex flex-col space-y-4 mt-4">
            {!user ? (
              <>
                <a href="#features" className="px-2 py-2 text-book-dark/80 hover:text-book-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Features
                </a>
                <a href="#how-it-works" className="px-2 py-2 text-book-dark/80 hover:text-book-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  How It Works
                </a>
                <a href="#faq" className="px-2 py-2 text-book-dark/80 hover:text-book-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  FAQ
                </a>
                <Link to="/blog" className="px-2 py-2 text-book-dark/80 hover:text-book-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Blog
                </Link>
              </>
            ) : (
              <>
                <Link to="/home" className="px-2 py-2 text-book-dark/80 hover:text-book-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Home
                </Link>
                <Link to="/dashboard" className="px-2 py-2 text-book-dark/80 hover:text-book-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/blog" className="px-2 py-2 text-book-dark/80 hover:text-book-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Blog
                </Link>
              </>
            )}
          </nav>

          <div className="pt-4 flex flex-col space-y-3">
            {user ? (
              <>
                <div 
                  className="flex items-center space-x-2 py-2 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={navigateToProfile}
                >
                  <div className="w-8 h-8 bg-book-accent/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-book-accent" />
                  </div>
                  <span className="text-sm text-book-dark/70">
                    {user.email?.split('@')[0]}
                  </span>
                </div>
                <Button variant="outline" fullWidth onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/signin" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" fullWidth>
                    Sign In
                  </Button>
                </Link>
                <Link to="/get-started" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" fullWidth>
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
