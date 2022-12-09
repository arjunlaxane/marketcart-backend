//connecting to mongodb

const mongoose = require('mongoose');

require('dotenv').config({ path: 'config.env' });

const connectDatabase = () => {
  mongoose
    .connect(process.env.DB_URL)
    .then(data => {
      console.log(`Mongo db connected with server ${data.connection.host}`);
    })
    .catch(err => {
      console.log('err', err);
    });
};

module.exports = connectDatabase;
