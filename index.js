const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId

const port = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.ug28d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("NFamBike");
        const productCollection = database.collection("products");
        const userCollection = database.collection("users");
        const orderCollection = database.collection("orders");



        // Product related api starts here
        app.get('/products', async (req, res) => {
            const limit = parseInt(req.query.limit);
            let products = []
            if (limit) {
                const cursor = productCollection.find({}).limit(limit)
                products = await cursor.toArray();
            } else {
                const cursor = productCollection.find({})
                products = await cursor.toArray();
            }
            res.json(products)
        })

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productCollection.findOne(query);
            res.json(result);
        })

        app.post('/products', async (req, res) => {
            const doc = req.body
            const result = await productCollection.insertOne(doc);
            res.json(result);
        })



        // User related api starts here
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result);
        });

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const options = { upsert: true };
            const updateDoc = { $set: user }
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.put('/users/admin', async (req, res) => {
            const user = req.body.requestedEmail
            const requester = req.body.requester;
            const requesterAcccount = await userCollection.findOne({ email: requester })
            if (requesterAcccount.role === 'admin') {
                const filter = { email: user.email }
                const updateDoc = { $set: { role: 'admin' } };
                const result = await userCollection.updateOne(filter, updateDoc);
                res.json(result);
            } else {
                res.status(401).json({ message: 'User does not have access to make admin' })
            }
        });



        // Order related api starts here
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            let orders = []
            if (email) {
                const cursor = orderCollection.find({ email: email })
                orders = await cursor.toArray();
            } else {
                const cursor = orderCollection.find({})
                orders = await cursor.toArray();
            }
            res.json(orders)
        })

        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        });


        //Check database connection
        app.get('/db', (req, res) => {
            res.send('Database connected')
        })
    } finally {
        // await client.close();
    }
}

run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('NFam-Bike Server Running')
})

app.listen(port, () => {
    console.log('NFam-Bike Server is Listening on port', port)
})