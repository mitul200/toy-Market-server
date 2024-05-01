const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());
console.log(process.env.DB_USER);

const allToy = require("./data/products.json");
const categoris = require("./data/categoris.json");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n0w8anz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productsCollection = client.db("toyShop").collection("products");

    app.get("/all-products", async (req, res) => {
      const products = productsCollection.find({}).sort({ createdAt: -1 });
      const result = await products.toArray();
      res.send(result);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(filter);
      res.send(result);
      // console.log(result);
    });

    app.post("/postProducts", async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      const result = await productsCollection.insertOne(body);
      res.send(result);
      console.log(result);
    });

    app.get("/myProducts/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await productsCollection
        .find({ email: { $regex: req.params.email, $options: "i" } })
        .toArray();
      res.send(result);
    });

    const indexKeys = { name: 1, subcategory: 1 };
    const indexOptions = { name: "nameSubcategory" };
    const result = await productsCollection.createIndex(
      indexKeys,
      indexOptions
    );

    app.get("/searchName/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await productsCollection
        .find({
          $or: [
            { name: { $regex: searchText, $options: "i" } },
            { subcategory: { $regex: searchText, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/allToy", (req, res) => {
  res.send(allToy);
});

app.get("/categoris", (req, res) => {
  res.send(categoris);
});
app.listen(port, () => {
  console.log(`car is running on port ${port}`);
});
