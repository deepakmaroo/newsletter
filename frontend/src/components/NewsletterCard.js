import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';

const NewsletterCard = ({ newsletter }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Calendar className="h-4 w-4 mr-1" />
          {formatDate(newsletter.publishedAt)}
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
          {newsletter.title}
        </h3>
        <div
          className="ql-editor mb-4 prose max-w-none line-clamp-3"
          style={{ background: 'transparent', padding: 0, minHeight: 0 }}
          dangerouslySetInnerHTML={{ __html: newsletter.excerpt || newsletter.content }}
        />
        <Link
          to={`/newsletter/${newsletter.id || newsletter._id}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          Read more
          <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
    </div>
  );
};

export default NewsletterCard;
