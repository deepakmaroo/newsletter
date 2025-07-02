import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Mail, Users, ArrowRight } from 'lucide-react';
import NewsletterCard from '../components/NewsletterCard';
import { fetchNewsletters } from '../utils/api';

const Home = () => {
  const { data: newsletters, isLoading, error } = useQuery('newsletters', fetchNewsletters);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg mb-12">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Stay Updated with Our Newsletter
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Get the latest insights, updates, and stories delivered directly to your inbox. 
            Join our community of engaged readers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/subscribe" 
              className="btn-primary inline-flex items-center justify-center"
            >
              <Mail className="h-5 w-5 mr-2" />
              Subscribe Now
            </Link>
            <Link 
              to="#newsletters" 
              className="btn-secondary inline-flex items-center justify-center"
            >
              View Latest Issues
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Weekly Issues</h3>
          <p className="text-gray-600">Fresh content delivered every week</p>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">1000+ Subscribers</h3>
          <p className="text-gray-600">Join our growing community</p>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <ArrowRight className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Quality Content</h3>
          <p className="text-gray-600">Curated insights and valuable information</p>
        </div>
      </section>

      {/* Latest Newsletters */}
      <section id="newsletters">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Latest Newsletter Issues
        </h2>
        
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading newsletters...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">Error loading newsletters. Please try again later.</p>
          </div>
        )}

        {newsletters && newsletters.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No newsletters available yet. Check back soon!</p>
          </div>
        )}

        {newsletters && newsletters.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsletters.map((newsletter) => (
              <NewsletterCard key={newsletter._id} newsletter={newsletter} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
