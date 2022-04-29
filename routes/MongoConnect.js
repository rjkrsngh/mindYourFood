const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'assignment';
var db;

// Use connect method to connect to the server
async function connectToMongo() {
    await MongoClient.connect(url, function(err, client) {
        assert.equal(null, err);
        console.log("Connected successfully to server");

        db = client.db(dbName);
    });
}

function readFromDB() {
    const collection = db.collection('meals');
    collection.find({}).toArray((err, docs) => {
        assert.equal(err, null);
        console.log('following documents found!');
        // console.log(docs);
        for (obj of docs) {
            console.log(obj.food_name, obj.calorie);
        }
    });
}

module.exports.connectToMongo = connectToMongo;
module.exports.db = db;