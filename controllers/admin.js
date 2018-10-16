const express = require("express");
const bcrypt = require("bcrypt-nodejs");

const router = express.Router();

const Admin = require("./../models/admin.js");
const jwt = require("../jwt.js");

const adminPolicy = require("./../policies/admin.js");

router.post("/create", adminPolicy, (req, res)=>{

    let username = req.body.username;
    let password = req.body.password;
    if(!username || !password){
        return res.status(406).json({err:"Username/Password is required"});
    }
    password = bcrypt.hashSync(password);
    Admin.create({username, password}, (err, data)=>{
        if(err){
            console.log(err);
            return res.status(500).json({err:"Something went wrong"});
        }
        return res.status(200).json({msg:"Admin created successfully"});
    });

});

router.post("/login", (req, res)=>{

    let username = req.body.username;
    let password = req.body.password;
    if(!username || !password){
        return res.status(401).json({err:"Invalid Username/Password"});
    }
    Admin.findOne({username}, (err, data)=>{
        
        if(err){
            return res.status(500).json({err:"Something went wrong"});
        }
        if(!data || !bcrypt.compareSync(password, data.password)){
            return res.status(401).json({err:"Invalid Username/Password"});
        }
        return res.status(200).json({msg:"Loggedin successfully", token: jwt.issueToken({username, admin:true}, "1d")});

    });

});

module.exports = router;