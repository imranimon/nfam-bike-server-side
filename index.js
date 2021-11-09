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

async function run(){
    try{
        await client.connect();

        // const database = client.db("NFamTravel");
        // const serviceCollection = database.collection("services");
        // const orderCollection = database.collection("orders")
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