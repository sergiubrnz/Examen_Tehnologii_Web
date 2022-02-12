const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./sqlite/examen.db",
});

const init = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
  require('../models/spacecraft');
  require('../models/astronaut');
  await sequelize.sync();
  const db = sequelize.models;
  Object.keys(db).forEach((model) => {
    if (db[model].associate) {
      db[model].associate(db);
    }
  });
  console.log('Models Synchronized!');
};

module.exports = { sequelize, init };