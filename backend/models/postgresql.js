const { Sequelize, DataTypes } = require('sequelize');

// Database connection will be initialized based on DATABASE_TYPE
let sequelize;

const initializeSequelize = () => {
  if (process.env.DATABASE_TYPE === 'postgresql') {
    sequelize = new Sequelize({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5432,
      database: process.env.POSTGRES_DB || 'newsletter',
      username: process.env.POSTGRES_USER || 'newsletter_user',
      password: process.env.POSTGRES_PASSWORD || 'newsletter_password',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });
  }
  return sequelize;
};

// User model for PostgreSQL
const createUserModel = (sequelize) => {
  return sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 255]
      }
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['email']
      }
    ]
  });
};

// Newsletter model for PostgreSQL
const createNewsletterModel = (sequelize) => {
  return sequelize.define('Newsletter', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 200]
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    excerpt: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 500]
      }
    },
    published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    }
  }, {
    timestamps: true,
    hooks: {
      beforeSave: (newsletter) => {
        if (newsletter.title && !newsletter.slug) {
          newsletter.slug = newsletter.title
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        }
      }
    },
    indexes: [
      {
        fields: ['published']
      },
      {
        fields: ['publishedAt']
      },
      {
        unique: true,
        fields: ['slug']
      }
    ]
  });
};

// Subscription model for PostgreSQL
const createSubscriptionModel = (sequelize) => {
  return sequelize.define('Subscription', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    subscribedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    unsubscribedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    source: {
      type: DataTypes.STRING,
      defaultValue: 'website'
    }
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['isActive']
      }
    ]
  });
};

// Initialize models
let User, Newsletter, Subscription;

const initializePostgreSQLModels = async () => {
  const sequelize = initializeSequelize();
  
  User = createUserModel(sequelize);
  Newsletter = createNewsletterModel(sequelize);
  Subscription = createSubscriptionModel(sequelize);

  // Sync database
  await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
  
  return { User, Newsletter, Subscription, sequelize };
};

module.exports = {
  initializePostgreSQLModels,
  initializeSequelize
};
