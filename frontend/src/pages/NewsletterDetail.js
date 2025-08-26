import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchNewsletterById } from '../utils/api';

const NewsletterDetail = () => {
  const { id } = useParams();
  const { data: newsletter, isLoading, error } = useQuery(
    ['newsletter', id],
    () => fetchNewsletterById(id)
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading newsletter...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Error loading newsletter. Please try again later.</p>
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!newsletter) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Newsletter not found.</p>
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Link 
        to="/" 
        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 mb-8"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to all newsletters
      </Link>

      <article className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(newsletter.publishedAt)}
            </div>            <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ textAlign: 'center' }}>
              {newsletter.title}
            </h1>

            {newsletter.excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed">
                {newsletter.excerpt}
              </p>
            )}
          </header>

          {/* Content */}
          <div className="ql-editor max-w-none bg-gray-50 border border-gray-100 rounded p-4 prose prose-lg">
            <div 
              dangerouslySetInnerHTML={{ __html: newsletter.content.replace(/\n/g, '<br />') }}
            />
          </div>
        </div>
      </article>

      {/* Call to action */}
      <div className="mt-12 text-center bg-gray-50 rounded-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Don't miss our latest updates
        </h3>
        <p className="text-gray-600 mb-6">
          Subscribe to our newsletter and get the latest content delivered to your inbox.
        </p>
        <Link to="/subscribe" className="btn-primary">
          Subscribe Now
        </Link>
      </div>
    </div>
  );
};

export default NewsletterDetail;
