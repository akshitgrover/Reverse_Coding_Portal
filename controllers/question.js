const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const Question = require("./../models/question.js");

const adminPolicy = require("./../policies/admin.js");
const userPolicy = require("./../policies/user.js");

router.post("/add", adminPolicy, (req, res)=>{

    Question.insertInc(req.body.output, (err, data)=>{
        
        if(err){
            console.log(err);
            return res.status(500).json({err:"Something went wrong"});
        }
        let numTestCases = req.body.numTestCases || 1;
        let testCasePaths = [];
        let mac = `/static/mac/que_${data.number.toString()}`; //path.join(__dirname, "../uploads/mac/que_" + data.number.toString());
        let win = `/static/win/que_${data.number.toString()}`; //path.join(__dirname, "../uploads/win/que_" + data.number.toString());
        let linux = `/static/linux/que_${data.number.toString()}`; //path.join(__dirname, "../uploads/linux/que_" + data.number.toString());

        for(var count = 0; count < numTestCases; count++){
            let testCasePath = path.join(__dirname, "../uploads/testCases/" + data.number.toString() + "_" + count.toString() + ".txt");
            testCasePaths.push(testCasePath);
        };

        console.log(req.body.output);
        Object.assign(data, {marking: req.body.marking, executable:{mac, win, linux}, testcases: testCasePaths, output: req.body.output});
        data.save();
        return res.status(200).json({msg:"Question added successfully"});

    });

});

router.get("/get", userPolicy, (req, res)=>{

    Question.find({}, {testcases:0, _id:0, __v:0}, (err, data)=>{

        if(err){
            return res.status(500).json({err:"Something went wrong"});
        }
        return res.status(200).json({questions: data});

    });

});

module.exports = router;