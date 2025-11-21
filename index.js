const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r81fqjh.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})


async function run() {
  try {

    const database = client.db('smart_db');
    const productsCollection = database.collection('products');
    const bidsCollection = database.collection('bids');
    const usersCollection = database.collection('users');

    app.post('/users', async(req, res) => {
      const newUser = req.body;
      const email = req.body.email;
      const query = { email: email }
      const existingUser = await usersCollection.findOne(query);

      if(existingUser){
        res.send({message:
           "User already exists"})
      } else{
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      }

    })

    app.post('/products', async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send(result)
    })

    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);

      res.send(result);
    })

    app.get('/latest-products', async (req, res) => {
      const cursor = productsCollection.find().sort({created_at: -1}).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.delete('/products/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await productsCollection.deleteOne(query);

        res.send(result);
    })

    // bids API's calls
    app.get('/bids', async (req, res) => {

      const email = req.query.email;
      const query = {};
      if(email){
        query.buyer_email = email;
      }

      const cursor = bidsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/products/bids/:productId', async(req, res) => {
      const productId = req.params.productId;
      const query = {product: productId};
      const cursor = bidsCollection.find(query).sort({ bid_price: -1 });
      const result = await cursor.toArray();

      res.send(result);
    })

    app.post('/bids', async (req, res) => {
      const newBid = req.body;
      const result = await bidsCollection.insertOne(newBid);
      res.send(result)
    })

    app.delete('/bids/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bidsCollection.deleteOne(query);

      res.send(result);
    })

    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    //await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Smart deals is listening on port ${port}`)
})


