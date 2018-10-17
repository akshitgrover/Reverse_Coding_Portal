const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multipart = require("connect-multiparty");
const path = require("path");

const env = require("./env.js");

const app = express();
env();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multipart({uploadDir: path.join(__dirname, "./uploads")}));

const AdminRouter = require("./controllers/admin.js");
const QuestionRouter = require("./controllers/question.js");
const AttemptRouter = require("./controllers/attempts.js");
const TeamRouter = require("./controllers/team.js");

app.use((req, res, next)=>{
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "*");
    next();
});

app.use("/admin", AdminRouter);
app.use("/question", QuestionRouter);
app.use("/attempt", AttemptRouter);
app.use("/team", TeamRouter);

app.use("/static", express.static(path.join(__dirname, "./uploads")));

mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true}, (err, db)=>{
    
    if(err){
        console.error("Error connecting to MongoDB");
        process.exit(1);
    }
    console.log("Connected to MongoDB");

});

app.listen(process.env.PORT, (err)=>{

    if(err){
        console.err(`Error listening on port ${process.env.PORT}`);
        process.exit(1);
    }
    console.log(`Listening on port ${process.env.PORT}`);

});