import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedBlogPosts } from '@/lib/blogService';
import { BlogPost } from '@/lib/types';
import BlogPostCard from './BlogPostCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const FeaturedBlogPosts: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const posts = await getFeaturedBlogPosts(3);
        setBlogPosts(posts);
      } catch (error) {
        console.error('Error fetching featured blog posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  if (isLoading) {
    return (
      <div className="py-16 bg-book-paper">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">Latest From Our Blog</h2>
            <p className="text-book-dark/70 text-lg">
              Insights, stories, and updates from the BookCircuit community
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

  if (blogPosts.length === 0) {
    return null; // Don't show the section if no posts
  }

  return (
    <div className="py-16 bg-book-paper">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">Latest From Our Blog</h2>
          <p className="text-book-dark/70 text-lg">
            Insights, stories, and updates from the BookCircuit community
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
              className="px-6"
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