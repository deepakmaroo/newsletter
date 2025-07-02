const bcrypt = require('bcryptjs');
const { connectDB, getModels, closeConnection } = require('./config/database');
const DatabaseAdapter = require('./utils/DatabaseAdapter');
require('dotenv').config();

// Sample data
const seedData = async () => {
  try {
    console.log(`\n🌱 Seeding database (${process.env.DATABASE_TYPE || 'mongodb'})...\n`);
    
    const db = new DatabaseAdapter();
    const models = getModels();
    
    // Clear existing data
    if (models.dbType === 'mongodb') {
      await models.User.deleteMany({});
      await models.Newsletter.deleteMany({});
      await models.Subscription.deleteMany({});
    } else {
      await models.User.destroy({ where: {} });
      await models.Newsletter.destroy({ where: {} });
      await models.Subscription.destroy({ where: {} });
    }
    
    console.log('✅ Cleared existing data');

    // Create admin user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminUser = await db.createUser({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });
    console.log('✅ Created admin user');

    // Create sample newsletters
    const newsletters = [
      {
        title: 'Welcome to Our Newsletter!',
        excerpt: 'Thank you for subscribing to our newsletter. Here\'s what you can expect from us.',
        content: `# Welcome to Our Newsletter!

We're thrilled to have you as part of our community. In this inaugural issue, we want to share what you can expect from our weekly newsletter.

## What We'll Cover

- **Industry Insights**: Stay updated with the latest trends and developments
- **Tips & Tricks**: Practical advice you can implement right away
- **Community Highlights**: Showcasing amazing work from our readers
- **Exclusive Content**: Premium content available only to subscribers

## Our Commitment

We promise to deliver valuable, actionable content every week. No spam, just quality information that helps you grow.

Thank you for joining us on this journey!

Best regards,
The Newsletter Team`,
        published: true,
        publishedAt: new Date('2025-06-01')
      },
      {
        title: 'Top 10 React Best Practices for 2025',
        excerpt: 'Discover the essential React practices every developer should follow this year.',
        content: `# Top 10 React Best Practices for 2025

React continues to evolve, and staying up-to-date with best practices is crucial for building maintainable applications.

## 1. Use Functional Components and Hooks

Modern React development favors functional components with hooks over class components.

## 2. Implement Proper Error Boundaries

Catch JavaScript errors anywhere in your component tree with error boundaries.

## 3. Optimize Performance with React.memo

Prevent unnecessary re-renders by wrapping components with React.memo.

## 4. Use TypeScript for Better Development Experience

TypeScript provides excellent tooling and helps catch errors early.

## 5. Follow Component Composition Patterns

Build flexible, reusable components using composition over inheritance.

## 6. Manage State Effectively

Choose the right state management solution for your application's complexity.

## 7. Implement Code Splitting

Use dynamic imports and React.lazy for better performance.

## 8. Test Your Components

Write comprehensive tests using Jest and React Testing Library.

## 9. Use Custom Hooks for Logic Reuse

Extract complex logic into custom hooks for better organization.

## 10. Follow Accessibility Guidelines

Make your applications inclusive by following WCAG guidelines.

These practices will help you build better React applications in 2025!`,
        published: true,
        publishedAt: new Date('2025-06-08')
      },
      {
        title: 'Building Scalable APIs with Node.js',
        excerpt: 'Learn how to design and implement APIs that can handle growth and scale effectively.',
        content: `# Building Scalable APIs with Node.js

Creating scalable APIs is essential for applications that need to handle increasing loads and user bases.

## Key Principles for Scalable APIs

### 1. Design for Statelessness
Ensure your API endpoints don't rely on server-side session state.

### 2. Implement Proper Caching
Use Redis or similar solutions for caching frequently accessed data.

### 3. Database Optimization
- Use database indexing effectively
- Implement connection pooling
- Consider read replicas for read-heavy operations

### 4. Rate Limiting and Throttling
Protect your API from abuse and ensure fair usage across clients.

### 5. Monitoring and Logging
Implement comprehensive logging and monitoring to track performance.

### 6. Load Balancing
Distribute traffic across multiple server instances.

## Implementation Tips

- Use async/await for better error handling
- Implement proper input validation
- Use environment variables for configuration
- Dockerize your applications for consistent deployments

Building scalable APIs requires planning, but following these principles will set you up for success!`,
        published: false
      }
    ];

    for (const newsletterData of newsletters) {
      await db.createNewsletter(newsletterData);
    }
    console.log('✅ Created sample newsletters');

    // Create sample subscriptions
    const subscriptions = [
      { email: 'subscriber1@example.com' },
      { email: 'subscriber2@example.com' },
      { email: 'subscriber3@example.com' },
      { email: 'test@example.com' }
    ];

    for (const subData of subscriptions) {
      await db.createSubscription(subData);
    }
    console.log('✅ Created sample subscriptions');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n👤 Admin Login Credentials:');
    console.log('📧 Email: admin@example.com');
    console.log('🔐 Password: password123');
    console.log(`\n💾 Database: ${models.dbType.toUpperCase()}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

// Run the seeding
const runSeed = async () => {
  await connectDB();
  await seedData();
  await closeConnection();
  process.exit(0);
};

runSeed();
