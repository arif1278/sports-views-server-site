const express =require('express');
const cors = require('cors');
const jwt=require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();


const app=express();
const port =process.env.PORT || 5000;


// add middleware
app.use(cors());


const question = require("./data/question.json");

// 


app.use(express.json());


console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD); 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hroyggj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

 function verifyJWT(req,res,next){
    const authHeader=req.headers.authorization;
    if(!authHeader){
        res.status(401).send({message: 'unauthorized access'})
    }
    const token=authHeader.split(' ')[1];
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,function(err,decoded){
        if(err){
            res.status(403).send({message: 'unauthorized access'})
        }
        req.decoded=decoded;
        next();
    })
 }


async function run(){

    try{
    const serviceCollection=client.db('sportsDay').collection('servs');
    const addServiceCollection=client.db('photoService').collection('addservs');
    const addReviewCollection=client.db('myreview').collection('review');

    // add post jwt in localstorage

app.post('/jwt',(req,res)=>{
    const user=req.body;
    const token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'10h'});
    res.send({token})
})


    app.get('/services',async(req,res)=>{
        const query ={}
        const cursor=serviceCollection.find(query);
        const service =await cursor.limit(3).toArray();
        res.send(service);
    });


    app.get("/services", async (req, res) => {
        const query = {};
        const services = await serviceCollection
          .find(query)
          .sort({ _id: -1 })
          .toArray();
        res.send(services);
      });

// add get serviceall

    app.get('/serviceall',async(req,res)=>{
        const query ={}
        const cursor=serviceCollection.find(query);
        const service =await cursor.toArray();
        res.send(service); 
    });
    app.get('/services/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id:ObjectId(id)};
        const service =await serviceCollection.findOne(query);
        res.send(service);
    });


    // add get service 


app.get('/services', async(req,res)=>{
const decoded=req.decoded;
console.log('inside service add api',decoded);
   if(decoded.email !==req.query.email){
    res.status(403).send({message: 'unathurized access'})
   }

let query={};
if(req.query.email){
    query={
        email:req.query.email
    }
}
const cursor=addServiceCollection.find(query);
const addservs=await cursor.toArray();
res.send(addservs);
});

// add post service in mongoDb

    app.post('/services',async(req,res)=>{
        const addserv=req.body;
        const result =addServiceCollection.insertOne(addserv);
        res.send(result); 
    }); 


// add get reviews sections partsSS
// add get reviews sections partsSS



app.get('/review',async(req,res)=>{
    let query={};
    if(req.query.email){
        query={
            email:req.query.email
        }
    }
    
    const cursor=addReviewCollection.find(query);
    const review=await cursor.toArray();
    res.send(review);
})

// add post review in mongDb

    app.post('/review',async(req,res)=>{
        const review=req.body;
        const result=addReviewCollection.insertOne(review);
        res.send(result);
    });

// delete review 

   app.get("/review/:serviceId", async (req, res) => {
      const id = req.params.serviceId;
      const query = { serviceId: id };
      const review = await addReviewCollection
        .find(query)
        .sort({ date: -1 })
        .toArray();
      res.send(review);
    });

    app.get("/myreviews/:userId", async (req, res) => {
      const id = req.params.userId;
      const query = { userId: id };
      const review = await addReviewCollection
        .find(query)
        .sort({ date: -1 })
        .toArray();
      res.send(review);
    });

    app.get("/myreview/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const myReview = await addReviewCollection.findOne(query);
      res.send(myReview);
    });

    app.put("/myreview/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const review = req.body;
      const option = { upsert: true };
      const updatedReview = {
        $set: {
          reviewMessage: review.review,
        },
      };
      const result = await addReviewCollection.updateOne(
        filter,
        updatedReview,
        option
      );
      res.send(result);
    }); 

    app.delete("/myreview/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await addReviewCollection.deleteOne(query);
      res.send(result);
    });

    }
    finally{

    }
} 
run().catch(err=> console.error(err));


app.get('/questions',(req,res)=>{
res.send(question);
})


app.get('/',(req,res)=>{
    res.send('sports view service server is running')
});






app.listen(port,()=>{
    console.log(`sports view service server running on ${port}`);
})