import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';
import sanitizeHtml from 'sanitize-html';

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
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(newsletter.excerpt || newsletter.content, {
            allowedTags: [
              'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol', 'li', 'b', 'i', 'strong', 'em', 'img', 'br', 'span', 'div', 'hr', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
            ],
            allowedAttributes: {
              a: ['href', 'name', 'target', 'rel', 'class'],
              img: ['src', 'alt', 'width', 'height', 'style', 'class'],
              '*': ['style', 'class']
            },
            allowedStyles: {
              '*': {
                'color': [/^.*$/],
                'background-color': [/^.*$/],
                'text-align': [/^.*$/],
                'font-weight': [/^.*$/],
                'font-size': [/^.*$/],
                'font-family': [/^.*$/],
                'width': [/^.*$/],
                'height': [/^.*$/],
                'border': [/^.*$/],
                'margin': [/^.*$/],
                'padding': [/^.*$/],
                'display': [/^.*$/]
              }
            },
            allowedSchemes: ['http', 'https', 'data'],
            allowProtocolRelative: true
          }) }}
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
