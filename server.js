var express = require('express');

var app = express();

app.use("/hello",(req,res)=>{
	res.send("<h1>Hello, ACM VIT Welcomes You.</h1>");
});