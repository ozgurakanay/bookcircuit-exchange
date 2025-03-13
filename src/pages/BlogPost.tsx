import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getBlogPostBySlug, formatBlogDate, markdownToHtml } from '@/lib/blogService';
import { BlogPost as BlogPostType } from '@/lib/types';
import Navbar from '@/components/ui-custom/Navbar';
import Footer from '@/components/ui-custom/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [blogPost, setBlogPost] = useState<BlogPostType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [htmlContent, setHtmlContent] = useState<string>('');

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        if (!slug) {
          navigate('/blog');
          return;
        }
        
        const post = await getBlogPostBySlug(slug);
        
        if (!post) {
          navigate('/blog');
          return;
        }
        
        setBlogPost(post);
        setHtmlContent(markdownToHtml(post.content));
      } catch (error) {
        console.error('Error fetching blog post:', error);
        navigate('/blog');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogPost();
  }, [slug, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow container mx-auto px-4 pt-36 pb-16">
          <div className="max-w-3xl mx-auto">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/3 mb-8" />
            <Skeleton className="h-[300px] w-full mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  if (!blogPost) {
    return null; // This should not happen due to the navigate call above
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pt-36 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 text-muted-foreground"
              onClick={() => navigate('/blog')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to all posts
            </Button>
            
            <h1 className="text-3xl md:text-4xl font-bold font-serif mb-4">
              {blogPost.title}
            </h1>
            
            <div className="flex flex-wrap items-center text-sm text-muted-foreground mb-8">
              <div className="flex items-center mr-6 mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                {formatBlogDate(blogPost.published_at)}
              </div>
              <div className="flex items-center mb-2">
                <User className="h-4 w-4 mr-2" />
                {blogPost.author}
              </div>
            </div>
          </div>
          
          {blogPost.featured_image_url && (
            <div className="mb-8">
              <img
                src={blogPost.featured_image_url}
                alt={blogPost.title}
                className="w-full h-auto rounded-lg object-cover"
                style={{ maxHeight: '500px' }}
              />
            </div>
          )}
          
          <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />
          
          <div className="mt-12 pt-8 border-t">
            <Link
              to="/blog"
              className="text-primary hover:underline flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to all blog posts
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogPost; 