import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { BlogPost } from '@/lib/types';
import { formatBlogDate } from '@/lib/blogService';
import { ArrowRight, BookOpen } from 'lucide-react';

interface BlogPostCardProps {
  post: BlogPost;
  className?: string;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post, className = '' }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Pre-load image when component mounts
  useEffect(() => {
    if (post.featured_image_url) {
      const img = new Image();
      img.src = post.featured_image_url;
      
      img.onload = () => {
        setImageLoading(false);
      };
      
      img.onerror = () => {
        setImageError(true);
        setImageLoading(false);
      };
    } else {
      setImageError(true);
      setImageLoading(false);
    }
  }, [post.featured_image_url]);

  // Generate a colorful gradient background based on post id
  const generateFallbackBackground = () => {
    // Use the last character of the post id to determine a color
    const lastChar = post.id.slice(-1);
    const colorIndex = parseInt(lastChar, 16) % 5; // 5 different color themes
    
    const gradients = [
      'bg-gradient-to-br from-purple-100 to-indigo-200',
      'bg-gradient-to-br from-blue-100 to-sky-200',
      'bg-gradient-to-br from-rose-100 to-pink-200',
      'bg-gradient-to-br from-amber-100 to-orange-200',
      'bg-gradient-to-br from-emerald-100 to-teal-200',
    ];
    
    return gradients[colorIndex];
  };

  return (
    <Link to={`/blog/${post.slug}`} className="block h-full group">
      <Card className={`h-full flex flex-col overflow-hidden transition-all group-hover:shadow-md group-hover:translate-y-[-4px] ${className} cursor-pointer`}>
        <div className="relative pt-[56.25%] bg-muted">
          {post.featured_image_url && !imageError ? (
            <>
              {imageLoading && (
                <div className={`absolute inset-0 flex items-center justify-center ${generateFallbackBackground()}`}>
                  <div className="w-8 h-8 border-4 border-book-accent/30 border-t-book-accent rounded-full animate-spin"></div>
                </div>
              )}
              <img
                src={post.featured_image_url}
                alt={post.title}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                onError={() => setImageError(true)}
                loading="lazy"
              />
            </>
          ) : (
            <div className={`absolute inset-0 flex items-center justify-center ${generateFallbackBackground()}`}>
              <div className="flex flex-col items-center">
                <BookOpen className="w-10 h-10 text-book-accent opacity-50 mb-2" />
                <span className="text-book-accent opacity-70 font-serif text-lg text-center px-4">
                  {post.title.length > 30 ? post.title.substring(0, 30) + '...' : post.title}
                </span>
              </div>
            </div>
          )}
        </div>
        
        <CardContent className="flex-grow p-5">
          <div className="text-sm text-book-accent mb-2 font-medium">
            {formatBlogDate(post.published_at)}
          </div>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 font-serif">
            {post.title}
          </h3>
          <p className="text-sm text-book-dark/70 line-clamp-3">
            {post.summary}
          </p>
        </CardContent>
        
        <CardFooter className="pt-0 px-5 pb-5">
          <span className="text-sm font-medium text-book-accent flex items-center gap-1">
            Read more
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default BlogPostCard; 