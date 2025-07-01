
import React, { useState } from 'react';
import Layout from '../components/Layout';
import FileUpload from '../components/FileUpload';
import FormatSelector from '../components/FormatSelector';
import ProgressIndicator from '../components/ProgressIndicator';
import { Zap, Shield, Globe, Clock } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../hooks/use-toast';

interface ConversionProgress {
  id: string;
  fileName: string;
  fromFormat: string;
  toFormat: string;
  progress: number;
  status: 'pending' | 'converting' | 'completed' | 'error';
  fileSize: string;
}

const Home = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [conversions, setConversions] = useState<ConversionProgress[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleFormatSelect = async (fromFormat: string, toFormat: string) => {
    if (selectedFiles.length === 0) return;
    
    setIsConverting(true);
    
    try {
      // Upload files
      const uploadResponse = await api.uploadFiles(selectedFiles, fromFormat, toFormat);
      const uploadedFiles = uploadResponse.files;
      
      // Initialize conversion progress
      const newConversions: ConversionProgress[] = uploadedFiles.map((file: any) => ({
        id: file.id,
        fileName: file.filename,
        fromFormat: file.originalFormat,
        toFormat: file.convertedFormat,
        progress: 0,
        status: 'pending' as const,
        fileSize: file.fileSize
      }));
      
      setConversions(newConversions);
      
      // Start conversion
      const fileIds = uploadedFiles.map((file: any) => file.id);
      await api.startConversion(fileIds);
      
      // Poll for progress updates
      fileIds.forEach((fileId: string) => {
        pollConversionProgress(fileId);
      });
      
      toast({
        title: "Conversion Started",
        description: `Converting ${selectedFiles.length} file(s)...`,
      });
      
    } catch (error) {
      console.error('Conversion error:', error);
      toast({
        title: "Conversion Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };
  
  const pollConversionProgress = async (fileId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const progress = await api.getConversionProgress(fileId);
        
        setConversions(current => 
          current.map(c => 
            c.id === fileId 
              ? { 
                  ...c, 
                  progress: progress.progress,
                  status: progress.status as 'pending' | 'converting' | 'completed' | 'error'
                }
              : c
          )
        );
        
        if (progress.status === 'completed' || progress.status === 'failed') {
          clearInterval(pollInterval);
          
          if (progress.status === 'completed') {
            toast({
              title: "Conversion Complete",
              description: `${progress.fileName} converted successfully!`,
            });
          }
        }
        
      } catch (error) {
        console.error('Progress polling error:', error);
        clearInterval(pollInterval);
      }
    }, 1000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Convert files in seconds with our optimized processing engine',
      color: 'from-yellow-100 to-orange-100',
      iconColor: 'text-yellow-600'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your files are encrypted and automatically deleted after conversion',
      color: 'from-green-100 to-emerald-100',
      iconColor: 'text-green-600'
    },
    {
      icon: Globe,
      title: '200+ Formats',
      description: 'Support for all major file formats across different categories',
      color: 'from-blue-100 to-cyan-100',
      iconColor: 'text-blue-600'
    },
    {
      icon: Clock,
      title: 'Batch Processing',
      description: 'Convert multiple files simultaneously to save time',
      color: 'from-purple-100 to-indigo-100',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50"></div>
          <div className="relative max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Convert Files
              <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Effortlessly
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your files between 200+ formats with professional quality. 
              Fast, secure, and completely free for everyone.
            </p>
          </div>
        </section>

        {/* Upload Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Start Converting
              </h2>
              <p className="text-lg text-gray-600">
                Upload your files and choose your desired format
              </p>
            </div>

            <div className="space-y-8">
              <FileUpload 
                onFileSelect={handleFileSelect}
                maxFiles={10}
              />

              {selectedFiles.length > 0 && (
                <FormatSelector 
                  onFormatSelect={handleFormatSelect} 
                  selectedFiles={selectedFiles}
                />
              )}

              {conversions.length > 0 && (
                <div className="space-y-4">
                  <ProgressIndicator conversions={conversions} />
                  
                  {conversions.some(c => c.status === 'completed') && (
                    <div className="text-center">
                      <p className="text-green-600 font-medium mb-2">✓ Conversion Complete!</p>
                      <p className="text-sm text-gray-600">Your files are ready for download</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose FormatFusion?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Experience the most advanced file conversion platform with enterprise-grade 
                security and blazing-fast processing speeds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Convert Your Files?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join millions of users who trust FormatFusion for their file conversion needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200 transform hover:scale-105">
                Start Converting Now
              </button>
              <button className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-purple-600 transition-all duration-200">
                Learn More
              </button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
