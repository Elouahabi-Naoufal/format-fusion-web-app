
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { Calendar, User, ArrowRight, Clock, Tag } from 'lucide-react';
import { api } from '../lib/api';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  readTime: string;
  category: string;
  tags: string[];
  image: string;
  featured: boolean;
}

const Blog = () => {
  const { id } = useParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.getBlogPosts(1, 20);
        setPosts(response.posts);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        // Fallback to mock data if API fails
        const mockPosts: BlogPost[] = [
      {
        id: '1',
        title: 'Complete Guide to PDF Conversion: Best Practices and Tips',
        excerpt: 'Learn everything you need to know about converting PDFs to and from various formats while maintaining quality and formatting.',
        content: `# Complete Guide to PDF Conversion

PDF files are ubiquitous in the digital world, but sometimes you need to convert them to other formats or create PDFs from different file types. This comprehensive guide will walk you through everything you need to know about PDF conversion.

## Why Convert PDFs?

There are several reasons why you might need to convert PDF files:

- **Editing Requirements**: PDFs are not easily editable, so converting to Word or other formats allows for modifications
- **Compatibility**: Some systems or applications may not support PDF files
- **Size Optimization**: Converting to other formats can sometimes reduce file size
- **Content Extraction**: Extract text, images, or data from PDFs for other uses

## Best Practices for PDF Conversion

### 1. Choose the Right Output Format

Different formats serve different purposes:
- **Word (DOCX)**: Best for editing text content
- **Excel (XLSX)**: Ideal for tabular data extraction
- **PowerPoint (PPTX)**: Great for presentation content
- **Images (JPG/PNG)**: Perfect for visual content preservation

### 2. Maintain Quality

When converting PDFs:
- Use high-resolution settings for image outputs
- Preserve formatting as much as possible
- Check for OCR accuracy in scanned documents
- Verify that all content is properly converted

### 3. Security Considerations

- Remove sensitive information before conversion
- Use password protection when necessary
- Be aware of metadata that might be preserved
- Consider using secure conversion tools

## Common Conversion Scenarios

### PDF to Word
This is one of the most common conversions, useful for:
- Editing documents
- Collaborative work
- Template creation
- Content reuse

### PDF to Excel
Perfect for:
- Data analysis
- Report generation
- Financial document processing
- Database imports

### Images to PDF
Combine multiple images into a single PDF for:
- Document compilation
- Presentation creation
- Archive purposes
- Sharing convenience

## Tips for Better Results

1. **Pre-process your files**: Clean up scanned documents before conversion
2. **Use appropriate tools**: Different tools excel at different conversion types
3. **Verify results**: Always check the converted file for accuracy
4. **Batch processing**: Convert multiple files simultaneously to save time
5. **Backup originals**: Keep original files as backups

## Conclusion

PDF conversion is a powerful tool that can significantly improve your document workflow. By following these best practices and understanding the strengths of different formats, you can ensure high-quality conversions that meet your specific needs.

Whether you're converting for editing, sharing, or archival purposes, the right approach will save you time and maintain document integrity.`,
        author: 'Sarah Johnson',
        publishDate: '2024-01-15',
        readTime: '8 min read',
        category: 'Tutorials',
        tags: ['PDF', 'Conversion', 'Documents', 'Tips'],
        image: 'photo-1498050108023-c5249f4df085',
        featured: true
      },
      {
        id: '2',
        title: 'Image Format Wars: JPEG vs PNG vs WEBP - Which Should You Choose?',
        excerpt: 'Dive deep into the world of image formats and discover which format is best for your specific needs in 2024.',
        content: `# Image Format Wars: JPEG vs PNG vs WEBP

Choosing the right image format can significantly impact your website's performance, storage costs, and user experience. Let's explore the strengths and weaknesses of the most popular image formats.

## JPEG: The Old Reliable

JPEG has been the standard for photography and complex images for decades.

**Pros:**
- Excellent compression for photographs
- Universal browser support
- Small file sizes for complex images
- Adjustable quality settings

**Cons:**
- Lossy compression reduces quality
- No transparency support
- Not ideal for images with text or sharp edges
- Quality degrades with each edit

**Best for:** Photographs, complex images with many colors, web images where file size is crucial.

## PNG: The Quality Champion

PNG offers lossless compression and advanced features that make it ideal for certain use cases.

**Pros:**
- Lossless compression maintains perfect quality
- Supports transparency (alpha channel)
- Great for images with text, logos, and sharp edges
- No quality loss when editing

**Cons:**
- Larger file sizes than JPEG
- Not ideal for photographs
- Limited animation support (APNG exists but isn't widely supported)

**Best for:** Logos, graphics with text, images requiring transparency, screenshots.

## WEBP: The Modern Contender

Google's WEBP format aims to combine the best of both worlds.

**Pros:**
- Superior compression compared to JPEG and PNG
- Supports both lossy and lossless compression
- Transparency support
- Animation support
- Modern compression algorithms

**Cons:**
- Limited browser support (though improving rapidly)
- Not all image editing tools support it
- May require fallback formats for older browsers

**Best for:** Modern web applications, progressive web apps, when cutting-edge compression is needed.

## Choosing the Right Format

### For Web Development
- **Hero images:** WEBP with JPEG fallback
- **Logos and icons:** SVG when possible, PNG otherwise
- **Product photos:** WEBP with JPEG fallback
- **Thumbnails:** WEBP with JPEG fallback

### For Print
- **High-quality photos:** TIFF or high-quality JPEG
- **Graphics and logos:** PDF or high-resolution PNG
- **Mixed content:** PDF

### for Social Media
- **Instagram:** JPEG for photos, PNG for graphics
- **Facebook:** JPEG optimized for the platform
- **Twitter:** PNG for graphics, JPEG for photos

## Future Considerations

New formats like AVIF are emerging with even better compression, but adoption takes time. The key is to:

1. Use modern formats with appropriate fallbacks
2. Implement responsive images
3. Optimize for your specific use case
4. Monitor browser support trends
5. Consider using a CDN with automatic format optimization

## Conclusion

There's no one-size-fits-all solution. The best format depends on your specific needs, target audience, and technical constraints. By understanding each format's strengths, you can make informed decisions that balance quality, performance, and compatibility.`,
        author: 'Mike Chen',
        publishDate: '2024-01-10',
        readTime: '6 min read',
        category: 'Technology',
        tags: ['Images', 'Web', 'Performance', 'Formats'],
        image: 'photo-1488590528505-98d2b5aba04b',
        featured: true
      },
      {
        id: '3',
        title: 'Audio File Formats Explained: MP3, FLAC, AAC and More',
        excerpt: 'Understanding different audio formats and when to use each one for the best balance of quality and file size.',
        content: `# Audio File Formats Explained

Audio formats can be confusing, with each offering different benefits for various use cases. Let's break down the most common formats and when to use them.

## Lossy vs. Lossless

Before diving into specific formats, it's important to understand the fundamental difference:

**Lossy formats** remove some audio data to achieve smaller file sizes. The removed data is typically inaudible to most people.

**Lossless formats** preserve all original audio data, resulting in perfect quality but larger file sizes.

## Popular Audio Formats

### MP3 - The Universal Standard
- **Type:** Lossy
- **Quality:** Good to very good
- **File size:** Small to medium
- **Compatibility:** Excellent
- **Best for:** General listening, streaming, portable devices

### FLAC - The Audiophile's Choice
- **Type:** Lossless
- **Quality:** Perfect
- **File size:** Large
- **Compatibility:** Good (modern devices)
- **Best for:** Archiving, critical listening, audio production

### AAC - Apple's Favorite
- **Type:** Lossy
- **Quality:** Better than MP3 at same bitrate
- **File size:** Small to medium
- **Compatibility:** Excellent (Apple ecosystem)
- **Best for:** iTunes, iOS devices, streaming services

### WAV - The Professional Standard
- **Type:** Lossless (uncompressed)
- **Quality:** Perfect
- **File size:** Very large
- **Compatibility:** Excellent
- **Best for:** Professional audio, mastering, short clips

## Choosing the Right Format

### For Music Listening
- **Casual listening:** MP3 320kbps or AAC 256kbps
- **High-quality listening:** FLAC or AAC 256kbps+
- **Storage-conscious:** AAC 128-192kbps

### For Professional Use
- **Recording/editing:** WAV or FLAC
- **Mastering:** WAV
- **Distribution:** Multiple formats depending on platform

### For Streaming
- **Live streaming:** AAC or MP3
- **On-demand:** AAC with multiple bitrates
- **Podcast:** MP3 128kbps (speech-optimized)

## Conversion Tips

1. **Always start with the highest quality source**
2. **Never convert lossy to lossy** (quality degrades)
3. **Use appropriate bitrates** for your use case
4. **Consider your target audience's** playback equipment
5. **Test different settings** to find the best balance

Understanding audio formats helps you make informed decisions about quality, file size, and compatibility for your specific needs.`,
        author: 'Alex Rivera',
        publishDate: '2024-01-08',
        readTime: '5 min read',
        category: 'Technology',
        tags: ['Audio', 'Music', 'Quality', 'Formats'],
        image: 'photo-1531297484001-80022131f5a1',
        featured: false
      },
      {
        id: '4',
        title: 'Video Compression: Balancing Quality and File Size',
        excerpt: 'Master the art of video compression with our comprehensive guide to codecs, bitrates, and optimization techniques.',
        content: `# Video Compression: Balancing Quality and File Size

Video compression is both an art and a science. Getting the right balance between quality and file size can make or break your project.

## Understanding Video Compression

Video compression works by removing redundant information and using mathematical algorithms to represent visual data more efficiently.

### Key Concepts

**Bitrate:** The amount of data processed per second
**Codec:** The algorithm used for compression/decompression
**Resolution:** The pixel dimensions of the video
**Frame Rate:** How many frames per second

## Popular Video Codecs

### H.264 (AVC)
- **Pros:** Universal compatibility, good quality
- **Cons:** Larger files compared to newer codecs
- **Best for:** General use, older devices

### H.265 (HEVC)
- **Pros:** 50% better compression than H.264
- **Cons:** Limited compatibility, licensing costs
- **Best for:** 4K content, modern devices

### AV1
- **Pros:** Open source, excellent compression
- **Cons:** Slow encoding, limited hardware support
- **Best for:** Streaming, future-proofing

## Optimization Strategies

### For Streaming
1. Use adaptive bitrate streaming
2. Optimize for target bandwidth
3. Consider device capabilities
4. Test on various networks

### For Storage
1. Use two-pass encoding
2. Optimize keyframe intervals
3. Remove unnecessary audio tracks
4. Crop black bars

### For Social Media
1. Follow platform specifications
2. Optimize for mobile viewing
3. Consider aspect ratios
4. Add captions for accessibility

## Best Practices

1. **Start with high-quality source material**
2. **Choose appropriate resolution** for your use case
3. **Test multiple bitrate settings**
4. **Consider your audience's** viewing conditions
5. **Use professional encoding tools** when possible

Video compression is crucial for modern media distribution. Understanding these concepts will help you deliver high-quality content efficiently.`,
        author: 'David Kim',
        publishDate: '2024-01-05',
        readTime: '7 min read',
        category: 'Tutorials',
        tags: ['Video', 'Compression', 'Streaming', 'Quality'],
        image: 'photo-1460925895917-afdab827c52f',
        featured: false
      }
        ];
        setPosts(mockPosts);
      }
    };

    const fetchSinglePost = async () => {
      if (id) {
        try {
          const post = await api.getBlogPost(id);
          setSelectedPost(post);
        } catch (error) {
          console.error('Error fetching blog post:', error);
          setSelectedPost(null);
        }
      }
    };

    if (id) {
      fetchSinglePost();
    } else {
      fetchPosts();
    }
  }, [id]);

  const categories = ['All', 'Tutorials', 'Technology', 'Tips', 'News'];
  
  const filteredPosts = selectedCategory === 'All' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  const featuredPosts = posts.filter(post => post.featured);

  // If viewing a specific post
  if (selectedPost) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            to="/blog"
            className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-8"
          >
            ← Back to Blog
          </Link>

          <article className="bg-white rounded-xl shadow-lg overflow-hidden">
            <img
              src={`https://images.unsplash.com/${selectedPost.image}?auto=format&fit=crop&w=1200&h=400`}
              alt={selectedPost.title}
              className="w-full h-64 object-cover"
            />
            
            <div className="p-8">
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {selectedPost.author}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(selectedPost.publishDate).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {selectedPost.readTime}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {selectedPost.title}
              </h1>

              <div className="flex items-center space-x-2 mb-6">
                <Tag className="h-4 w-4 text-gray-400" />
                {selectedPost.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="prose max-w-none">
                {selectedPost.content.split('\n').map((paragraph, index) => {
                  if (paragraph.startsWith('# ')) {
                    return <h1 key={index} className="text-2xl font-bold mt-8 mb-4">{paragraph.slice(2)}</h1>;
                  } else if (paragraph.startsWith('## ')) {
                    return <h2 key={index} className="text-xl font-semibold mt-6 mb-3">{paragraph.slice(3)}</h2>;
                  } else if (paragraph.startsWith('### ')) {
                    return <h3 key={index} className="text-lg font-medium mt-4 mb-2">{paragraph.slice(4)}</h3>;
                  } else if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    return <p key={index} className="font-semibold mb-3">{paragraph.slice(2, -2)}</p>;
                  } else if (paragraph.startsWith('- ')) {
                    return <li key={index} className="mb-1">{paragraph.slice(2)}</li>;
                  } else if (paragraph.trim() === '') {
                    return <br key={index} />;
                  } else {
                    return <p key={index} className="mb-4 leading-relaxed">{paragraph}</p>;
                  }
                })}
              </div>
            </div>
          </article>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-purple-600 to-blue-600 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Our Blog
              </h1>
              <p className="text-xl text-purple-100 max-w-3xl mx-auto">
                Stay updated with the latest tips, tutorials, and insights about file conversion,
                digital workflows, and productivity tools.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Posts</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {featuredPosts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.id}`}
                    className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <img
                      src={`https://images.unsplash.com/${post.image}?auto=format&fit=crop&w=600&h=300`}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="p-6">
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                          {post.category}
                        </span>
                        <span>{post.readTime}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <User className="h-4 w-4" />
                          <span>{post.author}</span>
                        </div>
                        <ArrowRight className="h-5 w-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Category Filter */}
        <section className="py-8 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-4 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.id}`}
                  className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <img
                    src={`https://images.unsplash.com/${post.image}?auto=format&fit=crop&w=400&h=200`}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-6">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                        {post.category}
                      </span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(post.publishDate).toLocaleDateString()}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Blog;
