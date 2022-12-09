const connectDatabase = require('./database');

var cloudinary = require('cloudinary').v2;

const express = require('express');

const fileUpload = require('express-fileupload');

const cors = require('cors');
var cloudinary = require('cloudinary').v2;

//config

require('dotenv').config({ path: 'config.env' });

const app = express();
app.use(cors());
//route imports.

const product = require('./routes/productsRoutes'); //path should be right

const user = require('./routes/userRoute');

const order = require('./routes/orderRoute');

const payment = require('./routes/paymentRoute');

app.use(express.json());

app.use(fileUpload({ useTempFiles: true }));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

app.use('/api/v1', product);

app.use('/api/v1', user);

app.use('/api/v1', order);

app.use('/api/v1', payment);

//connecting to database
connectDatabase();

const port = process.env.PORT || 4000;

// app.get('/', (req, res) => res.send(`Server Running`));

//creating server app.listen
app.listen(port, () => {
  console.log(`Server is working on http://localhost:${port}`);
});
