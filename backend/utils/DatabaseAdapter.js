const { getModels } = require('../config/database');

// Database adapter to handle differences between MongoDB and PostgreSQL
class DatabaseAdapter {
  constructor() {
    this.models = getModels();
  }

  // User operations
  async createUser(userData) {
    if (this.models.dbType === 'mongodb') {
      const user = new this.models.User(userData);
      return await user.save();
    } else {
      return await this.models.User.create(userData);
    }
  }

  async findUserByEmail(email) {
    if (this.models.dbType === 'mongodb') {
      return await this.models.User.findOne({ email });
    } else {
      return await this.models.User.findOne({ where: { email } });
    }
  }

  async findUserById(id) {
    if (this.models.dbType === 'mongodb') {
      return await this.models.User.findById(id).select('-password');
    } else {
      return await this.models.User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });
    }
  }

  // Newsletter operations
  async findPublishedNewsletters() {
    if (this.models.dbType === 'mongodb') {
      return await this.models.Newsletter.find({ published: true })
        .select('title content excerpt publishedAt')
        .sort({ publishedAt: -1 });
    } else {
      return await this.models.Newsletter.findAll({
        where: { published: true },
        attributes: ['id', 'title', 'content', 'excerpt', 'publishedAt', 'createdAt'],
        order: [['publishedAt', 'DESC']]
      });
    }
  }

  async findNewsletterById(id) {
    if (this.models.dbType === 'mongodb') {
      return await this.models.Newsletter.findOne({
        _id: id,
        published: true
      });
    } else {
      return await this.models.Newsletter.findOne({
        where: { id, published: true }
      });
    }
  }

  async findAllNewsletters() {
    if (this.models.dbType === 'mongodb') {
      return await this.models.Newsletter.find().sort({ createdAt: -1 });
    } else {
      return await this.models.Newsletter.findAll({
        order: [['createdAt', 'DESC']]
      });
    }
  }

  async createNewsletter(newsletterData) {
    if (this.models.dbType === 'mongodb') {
      const newsletter = new this.models.Newsletter(newsletterData);
      return await newsletter.save();
    } else {
      return await this.models.Newsletter.create(newsletterData);
    }
  }

  async updateNewsletter(id, updateData) {
    if (this.models.dbType === 'mongodb') {
      return await this.models.Newsletter.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      await this.models.Newsletter.update(updateData, { where: { id } });
      return await this.models.Newsletter.findByPk(id);
    }
  }

  async deleteNewsletter(id) {
    if (this.models.dbType === 'mongodb') {
      return await this.models.Newsletter.findByIdAndDelete(id);
    } else {
      const newsletter = await this.models.Newsletter.findByPk(id);
      if (newsletter) {
        await newsletter.destroy();
        return true;
      }
      return null;
    }
  }

  async findNewsletterByIdForUpdate(id) {
    if (this.models.dbType === 'mongodb') {
      return await this.models.Newsletter.findById(id);
    } else {
      return await this.models.Newsletter.findByPk(id);
    }
  }

  // Subscription operations
  async findSubscriptionByEmail(email) {
    if (this.models.dbType === 'mongodb') {
      return await this.models.Subscription.findOne({ email });
    } else {
      return await this.models.Subscription.findOne({ where: { email } });
    }
  }

  async createSubscription(subscriptionData) {
    if (this.models.dbType === 'mongodb') {
      const subscription = new this.models.Subscription(subscriptionData);
      return await subscription.save();
    } else {
      return await this.models.Subscription.create(subscriptionData);
    }
  }

  async updateSubscription(subscription, updateData) {
    if (this.models.dbType === 'mongodb') {
      Object.assign(subscription, updateData);
      return await subscription.save();
    } else {
      return await subscription.update(updateData);
    }
  }

  async findActiveSubscriptions() {
    if (this.models.dbType === 'mongodb') {
      return await this.models.Subscription.find({ isActive: true })
        .select('email subscribedAt')
        .sort({ subscribedAt: -1 });
    } else {
      return await this.models.Subscription.findAll({
        where: { isActive: true },
        attributes: ['email', 'subscribedAt'],
        order: [['subscribedAt', 'DESC']]
      });
    }
  }

  // Generic field name mapping
  getIdField() {
    return this.models.dbType === 'mongodb' ? '_id' : 'id';
  }

  formatIdForClient(document) {
    if (this.models.dbType === 'mongodb') {
      const obj = document.toObject();
      obj.id = obj._id;
      delete obj._id;
      delete obj.__v;
      return obj;
    } else {
      return document.dataValues || document;
    }
  }

  formatArrayForClient(documents) {
    return documents.map(doc => this.formatIdForClient(doc));
  }
}

module.exports = DatabaseAdapter;
