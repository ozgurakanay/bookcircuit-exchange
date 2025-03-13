import React, { useState, useEffect } from 'react';
import { getAllBlogPosts } from '@/lib/blogService';
import { BlogPost } from '@/lib/types';
import Navbar from '@/components/ui-custom/Navbar';
import Footer from '@/components/ui-custom/Footer';
import BlogPostCard from '@/components/ui-custom/BlogPostCard';
import { BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Blog = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const posts = await getAllBlogPosts();
        setBlogPosts(posts);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pt-36 pb-16">
        <h1 className="text-3xl md:text-4xl font-bold font-serif mb-8">BookCircuit Blog</h1>
        
        <p className="text-lg text-muted-foreground mb-10 max-w-3xl">
          Thoughts and stories about book trading, community building, and the future of reading.
        </p>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex flex-col space-y-3">
                <Skeleton className="h-[200px] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : blogPosts.length === 0 ? (
          <div className="text-center p-12 border rounded-lg">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <p className="text-muted-foreground">No blog posts available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map(post => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Blog; 