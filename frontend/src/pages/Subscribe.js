import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { subscribeToNewsletter } from '../utils/api';

const Subscribe = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await subscribeToNewsletter(data.email);
      setIsSubscribed(true);
      toast.success('Successfully subscribed to our newsletter!');
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to subscribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Our Newsletter!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Thank you for subscribing. You'll receive our latest updates and content 
            directly in your inbox.
          </p>
          <button
            onClick={() => setIsSubscribed(false)}
            className="btn-primary"
          >
            Subscribe Another Email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-8">
        <Mail className="h-16 w-16 text-blue-600 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Subscribe to Our Newsletter
        </h1>
        <p className="text-lg text-gray-600">
          Join thousands of readers and get the latest insights, updates, and stories 
          delivered directly to your inbox.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Subscribing...
              </div>
            ) : (
              'Subscribe Now'
            )}
          </button>
        </form>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">What you'll get:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Weekly newsletter with curated content</li>
            <li>• Exclusive insights and updates</li>
            <li>• No spam, unsubscribe anytime</li>
            <li>• Free and always will be</li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already subscribed? Check your subscription status by entering your email above.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
