import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedBlogPosts } from '@/lib/blogService';
import { BlogPost } from '@/lib/types';
import BlogPostCard from './BlogPostCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

const FeaturedBlogPosts: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Add a small delay to ensure images have time to be processed
        const posts = await getFeaturedBlogPosts(3);
        
        // Pre-load images for smoother rendering
        if (posts.length > 0) {
          posts.forEach(post => {
            if (post.featured_image_url) {
              const img = new Image();
              img.src = post.featured_image_url;
            }
          });
        }
        
        setBlogPosts(posts);
      } catch (error) {
        console.error('Error fetching featured blog posts:', error);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  if (isLoading) {
    return (
      <div className="py-16 bg-book-warm-cream">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4 text-book-leather">Latest From Our Blog</h2>
            <p className="text-book-dark/80 text-lg">
              Insights, stories, and updates from the Turtle Turning Pages community
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex flex-col space-y-3">
                <Skeleton className="h-[200px] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 bg-book-warm-cream">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="text-book-accent h-8 w-8" />
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-book-leather">Something went wrong</h2>
            <p className="text-book-dark/80 mb-6">{error}</p>
            <Button 
              variant="secondary" 
              onClick={() => window.location.reload()} 
              className="px-6 bg-book-leather text-white hover:bg-book-leather/90"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!blogPosts || blogPosts.length === 0) {
    return null; // Don't show the section if no posts
  }

  return (
    <div className="py-16 bg-book-warm-cream">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4 text-book-leather">Latest From Our Blog</h2>
          <p className="text-book-dark/80 text-lg">
            Insights, stories, and updates from the Turtle Turning Pages community
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {blogPosts.map(post => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Link to="/blog">
            <Button 
              variant="secondary" 
              className="px-6 bg-book-leather text-white hover:bg-book-leather/90"
            >
              View all blog posts
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeaturedBlogPosts; 