const mongoose = require('mongoose');
const { initializePostgreSQLModels } = require('../models/postgresql');

let models = {};
let dbConnection = null;

const connectDB = async () => {
  const databaseType = process.env.DATABASE_TYPE || 'mongodb';
  
  try {
    if (databaseType === 'mongodb') {
      const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newsletter', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      
      // Load MongoDB models
      models.User = require('../models/User');
      models.Newsletter = require('../models/Newsletter');
      models.Subscription = require('../models/Subscription');
      models.dbType = 'mongodb';
      
    } else if (databaseType === 'postgresql') {
      const { User, Newsletter, Subscription, sequelize } = await initializePostgreSQLModels();
      dbConnection = sequelize;
      
      await sequelize.authenticate();
      console.log('PostgreSQL Connected successfully');
      
      // Load PostgreSQL models
      models.User = User;
      models.Newsletter = Newsletter;
      models.Subscription = Subscription;
      models.dbType = 'postgresql';
      models.sequelize = sequelize;
      
    } else {
      throw new Error(`Unsupported database type: ${databaseType}`);
    }
    
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

const getModels = () => models;

const closeConnection = async () => {
  if (models.dbType === 'mongodb') {
    await mongoose.connection.close();
  } else if (models.dbType === 'postgresql' && dbConnection) {
    await dbConnection.close();
  }
};

module.exports = { connectDB, getModels, closeConnection };
