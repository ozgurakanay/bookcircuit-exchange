
import React from 'react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

const FeatureCard = ({ title, description, icon, className }: FeatureCardProps) => {
  return (
    <div 
      className={cn(
        "glass-card rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px]",
        className
      )}
    >
      <div className="feature-icon-container mb-5">
        {icon}
      </div>
      <h3 className="text-xl font-semibold font-serif mb-3 text-book-dark">{title}</h3>
      <p className="text-book-dark/70">{description}</p>
    </div>
  );
};

export default FeatureCard;
