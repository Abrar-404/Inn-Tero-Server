const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server Running On Speed');
});

app.listen(port, () => {
  console.log(`Port is running on: ${port}`);
});

// added something
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server Running On Speed');
});

app.listen(port, () => {
  console.log(`Port is running on: ${port}`);
});
