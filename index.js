const express = require("express");
const app = express();
const cors = require("cors");
const admin = require("firebase-admin");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3be27.mongodb.net/arabian?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const serviceAccount = require("./config/e-commerce-94a37-firebase-adminsdk-wp8r4-ca13c62603.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get("/", (req, res) => res.send("Hello World!"));

client.connect((err) => {
  const collection = client.db("arabian").collection("arabianhorse");
  app.get("/showData", (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith("Bearer ")) {
      const idToken = bearer.split(" ")[1];
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          let tokenEmail = decodedToken.email;
          if (tokenEmail == req.query.email) {
            collection
              .find({ email: req.query.email })
              .toArray((err, documents) => {
                res.send(documents);
              });
          }
        })
        .catch((error) => {
          // Handle error
        });
    }
  });

  app.post("/booking", (req, res) => {
    const bookingData = req.body;
    collection.insertOne(bookingData).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  console.log("Database connected");
});

app.listen(5000);
