const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eted0lc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// our middleware
const logger = async (req, res, next) => {
  console.log('called logger', req.host, req.originalUrl);
  next();
};

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  console.log('value of token', token);
  if (!token) {
    return res.status(401).send({ message: 'Unauthorized Access' });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send({ message: 'Unauthorized Access' });
    }
    console.log('value found', decoded);
    req.user = decoded;
    next();
  });
};
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const featureCollection = client
      .db('featureCollection')
      .collection('feature');

    const roomCollection = client.db('featureCollection').collection('rooms');
    const addRoomCollection = client
      .db('featureCollection')
      .collection('addRoom');

    // jwt related
    app.post('/jwt', logger, async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h',
      });
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: false,
        })
        .send({ success: true });
    });

    // feature section
    app.get('/feature', logger, async (req, res) => {
      const cursor = featureCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // room section
    app.get('/rooms', logger, async (req, res) => {
      const cursor = roomCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/rooms/:id', logger, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roomCollection.findOne(query);
      res.send(result);
    });

    // room add related
    app.get('/addRoom', logger, async (req, res) => {
      console.log(req.query.email);
      console.log(req.cookies.token);

      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      // if (req.query.email !== req.user?.email) {
      //   return res.status(403).send({ message: 'Forbidden Access' });
      // }
      const result = await addRoomCollection.find(query).toArray();
      res.send(result);
    });

    app.post('/addRoom', logger, async (req, res) => {
      const added = req.body;
      console.log(added);
      const result = await addRoomCollection.insertOne(added);
      res.send(result);
    });

    app.delete('/addRoom/:id', logger, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addRoomCollection.deleteOne(query);
      res.send(result);
    });

    app.get('/sortedPrice/:id', async (req, res) => {
      const sortedValue = req.params.id;
      console.log(sortedValue);
      if (sortedValue === 'low') {
        const products = await roomCollection
          .find()
          .sort({ price: 1 })
          .toArray();
        res.json(products);
        return;
      } else if (sortedValue == 'high') {
        const products = await roomCollection
          .find()
          .sort({ price: -1 })
          .toArray();
        res.json(products);
        return;
      } else {
        const products = await roomCollection.find().toArray();
        res.json(products);
        return;
      }
    });

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Server Running On Speed');
});

app.listen(port, () => {
  console.log(`Port is running on: ${port}`);
});
