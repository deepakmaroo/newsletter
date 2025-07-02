import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import NewsletterDetail from './pages/NewsletterDetail';
import Subscribe from './pages/Subscribe';
import Admin from './pages/Admin';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/newsletter/:id" element={<NewsletterDetail />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
