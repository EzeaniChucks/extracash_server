// import Websocket from 'ws';

const express = require("express");
const authrouter = require("./router/authrouter");
const { default: mongoose } = require("mongoose");
const adminrouter = require("./router/adminrouter");
const walletrouter = require("./router/walletrouter");
const userrouter = require("./router/userrouter");
const { HttpServerError, HttpSuccess } = require("./util/responses");
const { populateFAQ, populateContacts, populateFundingDetails } = require("./util/helpers");
require("dotenv").config();

const app = express();

//define middlewares
app.use(express.json());
app.use("/api/auth", authrouter);
app.use("/api/admin", adminrouter);
app.use("/api/user", userrouter);
app.use("/api/wallet", walletrouter);

app.get('/', async(req, res)=>{
  try{
    await populateFAQ()
    await populateContacts()
    await populateFundingDetails()
    return HttpSuccess(res, 'Welcome to extracash api')
  }catch(e){
    return HttpServerError(res, e?.messae)
  }
})

//port
const port = process.env.PORT || 5000;

//make connection
app.listen(port, async () => {
  try {
    console.log(`server connected on port ${port}`);
    await mongoose.connect(process.env.DB_CONNECTION);
    console.log(`db connected`);
  } catch (e) {
    console.log(`Something went wrong: ${e?.message}`);
  }
});