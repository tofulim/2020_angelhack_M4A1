const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

const sequelize = new Sequelize(
  config.database, config.username, config.password, config
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.User = require('./user')(sequelize, Sequelize);
db.Host = require('./host')(sequelize, Sequelize);
db.Creditlist = require('./creditlist')(sequelize, Sequelize);
db.Receiptlist = require('./receipt')(sequelize, Sequelize);

module.exports = db;
