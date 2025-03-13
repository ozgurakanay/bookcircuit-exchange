
import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  fullWidth?: boolean;
  as?: React.ElementType;
  href?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, fullWidth = false, as: Component = 'button', href, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-book-accent/50 focus:ring-offset-2 disabled:opacity-70 disabled:pointer-events-none';
    
    const variants = {
      primary: 'bg-book-accent text-white hover:bg-book-accent/90 shadow-md hover:shadow-lg',
      secondary: 'bg-book-light text-book-dark hover:bg-book-light/80',
      outline: 'border border-book-accent/20 text-book-dark hover:bg-book-accent/5',
      ghost: 'text-book-dark hover:bg-book-accent/5'
    };
    
    const sizes = {
      sm: 'text-sm px-3 py-1.5',
      md: 'text-sm px-4 py-2',
      lg: 'text-base px-6 py-3'
    };

    const combinedClassNames = cn(
      baseStyles,
      variants[variant],
      sizes[size],
      fullWidth ? 'w-full' : '',
      variant === 'primary' ? 'button-shimmer' : '',
      className
    );
    
    if (Component !== 'button') {
      return (
        <Component 
          className={combinedClassNames}
          href={href}
          {...props}
        >
          {children}
        </Component>
      );
    }
    
    return (
      <button
        className={combinedClassNames}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
