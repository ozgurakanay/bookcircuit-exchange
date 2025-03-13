import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { BlogPost } from '@/lib/types';
import { formatBlogDate } from '@/lib/blogService';
import { ArrowRight } from 'lucide-react';

interface BlogPostCardProps {
  post: BlogPost;
  className?: string;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post, className = '' }) => {
  return (
    <Card className={`h-full flex flex-col overflow-hidden hover:shadow-md transition-all hover:translate-y-[-4px] ${className}`}>
      <div className="relative pt-[56.25%] bg-muted">
        {post.featured_image_url ? (
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-blog.jpg';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-book-accent/5">
            <span className="text-book-accent opacity-30 font-serif text-2xl">BookCircuit</span>
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
        <Link 
          to={`/blog/${post.slug}`}
          className="text-sm font-medium text-book-accent hover:text-book-dark flex items-center gap-1 group"
        >
          Read more
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </CardFooter>
    </Card>
  );
};

export default BlogPostCard; 