import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Shield, Eye, EyeOff, Users, FileText, Plus, Code, Type } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginAdmin } from '../utils/api';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github.css';

import {
  fetchAllNewsletters,
  createNewsletter,
  updateNewsletter,
  deleteNewsletter,
  fetchAllSubscriptions,
  sendNewsletter,
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  testSendNewsletter
} from '../utils/api';

// Custom toolbar for advanced rich text features
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean']
  ]
};
const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'align',
  'list', 'bullet', 'blockquote', 'code-block',
  'link', 'image'
];

const TABS = {
  NEWSLETTERS: 'Newsletters',
  SUBSCRIBERS: 'Subscribers',
};

// Preview modal component
function PreviewModal({ open, onClose, title, content, isMarkdown = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-6 relative max-h-[90vh] overflow-hidden">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
        <h2 className="text-2xl font-bold mb-4">Preview: {title}</h2>
        <div className="border border-gray-100 rounded bg-gray-50 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)', padding: 16 }}>
          {isMarkdown ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
              className="prose max-w-none"
            >
              {content}
            </ReactMarkdown>
          ) : (
            <div
              className="ql-editor max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const [editingNewsletter, setEditingNewsletter] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [failedEmails, setFailedEmails] = useState([]);
  const [activeTab, setActiveTab] = useState(TABS.NEWSLETTERS);
  const [editorValue, setEditorValue] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [editorMode, setEditorMode] = useState('rich'); // 'rich' or 'markdown'
  const [markdownContent, setMarkdownContent] = useState('');
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Fetch newsletters
  const { data: newsletters = [], isLoading: loadingNewsletters } = useQuery(
    ['admin-newsletters', token],
    () => fetchAllNewsletters(token),
    { enabled: isLoggedIn }
  );

  // Fetch subscribers
  const { data: subscriberData = { count: 0, subscriptions: [] }, isLoading: loadingSubs } = useQuery(
    ['admin-subscribers', token],
    () => fetchAllSubscriptions(token),
    { enabled: isLoggedIn }
  );

  // Mutations
  const createMutation = useMutation((data) => createNewsletter(data, token), {
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-newsletters', token]);
      setShowForm(false);
      setEditingNewsletter(null);
      toast.success('Newsletter created!');
    },
    onError: () => toast.error('Failed to create newsletter')
  });
  const updateMutation = useMutation(({ id, data }) => updateNewsletter(id, data, token), {
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-newsletters', token]);
      setShowForm(false);
      setEditingNewsletter(null);
      toast.success('Newsletter updated!');
    },
    onError: () => toast.error('Failed to update newsletter')
  });
  const deleteMutation = useMutation((id) => deleteNewsletter(id, token), {
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-newsletters', token]);
      toast.success('Newsletter deleted!');
    },
    onError: () => toast.error('Failed to delete newsletter')
  });
  const sendMutation = useMutation((id) => sendNewsletter(id, token), {
    onSuccess: (data) => {
      toast.success(data.message || 'Newsletter sent!');
      setFailedEmails(data.failedEmails || []);
    },
    onError: () => {
      toast.error('Failed to send newsletter');
      setFailedEmails([]);
    }
  });
  const testSendMutation = useMutation(
    ({ id, email }) => testSendNewsletter(id, email, token),
    {
      onSuccess: (data) => toast.success(data.message || 'Test email sent!'),
      onError: () => toast.error('Failed to send test email'),
    }
  );

  // Mutations for subscriber management
  const unsubscribeMutation = useMutation(
    (email) => unsubscribeFromNewsletter(email),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-subscribers', token]);
        toast.success('Subscriber unsubscribed');
      },
      onError: () => toast.error('Failed to unsubscribe')
    }
  );
  const resubscribeMutation = useMutation(
    (email) => subscribeToNewsletter(email),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-subscribers', token]);
        toast.success('Subscriber resubscribed');
      },
      onError: () => toast.error('Failed to resubscribe')
    }
  );

  // Newsletter form logic
  const {
    register: formRegister,
    handleSubmit: handleFormSubmit,
    reset: resetForm,
    getValues, // <-- Add this line to destructure getValues
    formState: { errors: formErrors }
  } = useForm();

  const onSubmitNewsletter = (data) => {
    // Get content based on editor mode
    const content = editorMode === 'markdown' ? 
      DOMPurify.sanitize(marked(markdownContent || '')) : 
      editorValue;
    
    const payload = { 
      ...data, 
      content,
      contentType: editorMode, // Store the content type for future editing
      rawMarkdown: editorMode === 'markdown' ? markdownContent : undefined
    };
    
    if (editingNewsletter) {
      updateMutation.mutate({ id: editingNewsletter.id || editingNewsletter._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (newsletter) => {
    setEditingNewsletter(newsletter);
    setShowForm(true);
    
    // Set editor mode based on stored content type or detect from content
    const contentType = newsletter.contentType || 'rich';
    setEditorMode(contentType);
    
    if (contentType === 'markdown' && newsletter.rawMarkdown) {
      setMarkdownContent(newsletter.rawMarkdown);
      setEditorValue(''); // Clear rich text editor
    } else {
      setEditorValue(newsletter.content || '');
      setMarkdownContent(''); // Clear markdown editor
    }
    
    setFailedEmails([]); // Clear failed emails when editing
    resetForm({
      title: newsletter.title,
      excerpt: newsletter.excerpt,
      content: newsletter.content,
      published: newsletter.published
    });
  };

  const handleCreate = () => {
    setActiveTab(TABS.NEWSLETTERS); // Always switch to Newsletters tab
    setEditingNewsletter(null);
    setShowForm(true);
    setEditorMode('rich'); // Default to rich text editor
    setEditorValue('');
    setMarkdownContent('');
    setFailedEmails([]); // Clear failed emails when creating
    resetForm({ title: '', excerpt: '', content: '', published: false });
  };

  const handleEditorModeChange = (mode) => {
    setEditorMode(mode);
    if (mode === 'markdown' && editorValue) {
      // Convert HTML to markdown (basic conversion)
      // For more sophisticated conversion, you could use a library like turndown
      setMarkdownContent(''); // Start fresh for now
    } else if (mode === 'rich' && markdownContent) {
      // Convert markdown to HTML
      setEditorValue(DOMPurify.sanitize(marked(markdownContent)));
    }
  };

  const onLogin = async (data) => {
    setIsLoading(true);
    try {
      const response = await loginAdmin(data);
      setToken(response.token);
      setIsLoggedIn(true);
      toast.success('Successfully logged in!');
      localStorage.setItem('adminToken', response.token);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setToken('');
    localStorage.removeItem('adminToken');
    toast.success('Logged out successfully');
  };

  // Check for existing token on component mount
  React.useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
    }
  }, []);

  // When switching tabs, clear failedEmails
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFailedEmails([]);
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h1>
            <p className="text-gray-600">Access the newsletter management dashboard</p>
          </div>

          <form onSubmit={handleSubmit(onLogin)} className="space-y-6">
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
                placeholder="admin@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
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
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Demo credentials: admin@example.com / password123
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <button onClick={handleLogout} className="btn-secondary">Logout</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Newsletters</h3>
              <p className="text-gray-600">{loadingNewsletters ? 'Loading...' : newsletters.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Subscribers</h3>
              <p className="text-gray-600">{loadingSubs ? 'Loading...' : subscriberData.count}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 cursor-pointer" onClick={handleCreate}>
          <div className="flex items-center">
            <Plus className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Create</h3>
              <p className="text-gray-600">New newsletter</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation (moved below tiles) */}
      <div className="mb-8 flex space-x-4 border-b">
        {Object.values(TABS).map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 font-medium border-b-2 transition-colors duration-200 ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-600'}`}
            onClick={() => handleTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === TABS.NEWSLETTERS && (
        <>
          {/* Newsletter Form */}
          {showForm && (
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-xl font-bold mb-4">{editingNewsletter ? 'Edit Newsletter' : 'Create Newsletter'}</h2>
              <form onSubmit={handleFormSubmit(onSubmitNewsletter)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input type="text" {...formRegister('title', { required: 'Title is required' })} className="w-full border rounded px-3 py-2" />
                  {formErrors.title && <p className="text-red-600 text-sm">{formErrors.title.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Excerpt</label>
                  <textarea 
                    {...formRegister('excerpt', { required: 'Excerpt is required', maxLength: { value: 200, message: 'Excerpt must be 200 characters or less' } })} 
                    className="w-full border rounded px-3 py-2 h-20 resize-none" 
                    placeholder="Brief description of the newsletter content (max 200 characters)"
                  />
                  {formErrors.excerpt && <p className="text-red-600 text-sm">{formErrors.excerpt.message}</p>}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Content</label>
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => handleEditorModeChange('rich')}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                          editorMode === 'rich' 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-gray-600 hover:text-blue-600'
                        }`}
                      >
                        <Type className="h-4 w-4" />
                        <span>Rich Text</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditorModeChange('markdown')}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                          editorMode === 'markdown' 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-gray-600 hover:text-blue-600'
                        }`}
                      >
                        <Code className="h-4 w-4" />
                        <span>Markdown</span>
                      </button>
                    </div>
                  </div>
                  
                  {editorMode === 'rich' ? (
                    <ReactQuill
                      theme="snow"
                      value={editorValue}
                      onChange={setEditorValue}
                      className="bg-white"
                      style={{ minHeight: 180, marginBottom: 8 }}
                      modules={quillModules}
                      formats={quillFormats}
                    />
                  ) : (
                    <div className="relative">
                      <textarea
                        value={markdownContent}
                        onChange={(e) => setMarkdownContent(e.target.value)}
                        className="w-full border rounded px-3 py-2 font-mono text-sm resize-none"
                        style={{ minHeight: 200 }}
                        placeholder="# Your Newsletter Title

## Introduction
Write your newsletter content in **Markdown** format...

### Features supported:
- **Bold** and *italic* text
- [Links](https://example.com)
- Lists and tables
- Code blocks
- And much more!"
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded">
                        Markdown Mode
                      </div>
                    </div>
                  )}
                  {formErrors.content && <p className="text-red-600 text-sm">{formErrors.content.message}</p>}
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" {...formRegister('published')} id="published" />
                  <label htmlFor="published" className="text-sm">Publish now</label>
                </div>
                <div className="flex space-x-2">
                  <button type="submit" className="btn-primary">{editingNewsletter ? 'Update' : 'Create'}</button>
                  <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setEditingNewsletter(null); }}>Cancel</button>
                  <button type="button" className="btn-outline" onClick={() => setShowPreview(true)}>Preview</button>
                </div>
              </form>
              <PreviewModal 
                open={showPreview} 
                onClose={() => setShowPreview(false)} 
                title={getValues('title') || (editingNewsletter && editingNewsletter.title) || ''} 
                content={editorMode === 'markdown' ? markdownContent : editorValue}
                isMarkdown={editorMode === 'markdown'}
              />
            </div>
          )}

          {/* Newsletters Table */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">All Newsletters</h2>
            {failedEmails.length > 0 && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
                <h3 className="font-semibold text-red-700 mb-2">Failed to send to the following emails:</h3>
                <ul className="list-disc pl-6 text-red-700">
                  {failedEmails.map((fail, idx) => (
                    <li key={fail.email || idx}>
                      <strong>{fail.email}</strong>: {fail.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {loadingNewsletters ? (
              <p>Loading newsletters...</p>
            ) : newsletters.length === 0 ? (
              <p>No newsletters found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Excerpt</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Published</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newsletters.map((n) => (
                      <tr key={n.id || n._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{n.title}</td>
                        <td className="px-4 py-2 text-sm text-gray-600 max-w-xs truncate">{n.excerpt || 'No excerpt'}</td>
                        <td className="px-4 py-2">{n.published ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-2 space-x-2">
                          <button className="btn-secondary" onClick={() => handleEdit(n)}>Edit</button>
                          <button className="btn-danger" onClick={() => deleteMutation.mutate(n.id || n._id)}>Delete</button>
                          {!n.published && (
                            <button className="btn-primary" onClick={() => updateMutation.mutate({ id: n.id || n._id, data: { ...n, published: true } })}>Publish</button>
                          )}
                          {n.published && (
                            <button className="btn-primary" onClick={() => sendMutation.mutate(n.id || n._id)}>Send</button>
                          )}
                          <button
                            className="btn-secondary"
                            onClick={() => {
                              const email = window.prompt('Enter email address to send this newsletter:');
                              if (email) testSendMutation.mutate({ id: n.id || n._id, email });
                            }}
                          >
                            Send to Email
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === TABS.SUBSCRIBERS && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Subscribers</h2>
          {loadingSubs ? (
            <p>Loading subscribers...</p>
          ) : subscriberData.subscriptions.length === 0 ? (
            <p>No subscribers found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subscribed At</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriberData.subscriptions.map((s) => (
                    <tr key={s.id || s._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{s.email}</td>
                      <td className="px-4 py-2">{new Date(s.subscribedAt).toLocaleString()}</td>
                      <td className="px-4 py-2 space-x-2">
                        {(s.isActive === undefined || s.isActive) ? (
                          <button className="btn-danger" onClick={() => unsubscribeMutation.mutate(s.email)}>Unsubscribe</button>
                        ) : (
                          <button className="btn-primary" onClick={() => resubscribeMutation.mutate(s.email)}>Resubscribe</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
