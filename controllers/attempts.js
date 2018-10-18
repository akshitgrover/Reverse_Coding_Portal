const express = require("express");
const fs = require("fs");
const path = require("path");
const boxConstructor = require("box-exec");
const { ObjectId } = require("mongoose").Types;

const router = express.Router();

const Question = require("./../models/question.js");
const Team = require("./../models/team.js");
const Attempt = require("./../models/attempts.js");
const config = require("./../config.js");

const userPolicy = require("./../policies/user.js");

router.post("/submit", userPolicy, (req, res)=>{

    let queNumber = req.body.que;
    if(res.locals.teamName === null){
        return res.status(406).json({err:"Please join a team before submitting any responses"});
    }
    let teamName = res.locals.teamName.split(" ").join("");
    let timeStamp = (new Date()).getTime().toString();
    let boxExec = boxConstructor();

    let createAttempt = (attempt)=>{
        Attempt.create(attempt, (err, data)=>{
            if(err){
                // return res.status(500).json({err:"Something went wrong"});
            }
            Team.aggregate([
                {
                    $match:{name: teamName}
                },
                {
                    $unwind: "$questions"
                },
                {
                    $match:{"questions.number": parseInt(queNumber)}
                },
                {
                    $sort: {"questions.score": -1}
                },
                {
                    $limit:1
                },
            ]).exec((err, teamData)=>{
                if(err){
                    console.log(err);
                    return res.status(500).json({err:"Something went wrong"});
                }
                let obj = teamData[0];
                let questionObj = {number:queNumber, score: attempt.score, attempts: [data._id.toString()]};
                if(obj === undefined){
                    Team.updateOne({name: teamName},{$inc:{score: attempt.score}, $push:{questions: questionObj}}, (err, data)=>{
                        if(err){
                            console.log(err);
                            return res.status(500).json({err:"Something went wrong"});
                        }
                        console.log(data);
                        return res.status(200).json({testCases: attempt.testCaseStats, score: attempt.score});
                        // return res.status(200).json({msg:"Score updated successfully"});
                    });
                } else{
                    let score = attempt.score - obj.questions.score
                    let incScore = (score > 0)? score : 0;
                    Team.updateOne({name: teamName}, {$inc:{score:incScore}, $push:{questions: questionObj}}, (err, data)=>{
                        if(err){
                            console.log(err);
                            return res.status(500).json({err:"Something went wrong"});
                        }
                        console.log(data);
                        return res.status(200).json({testCases: attempt.testCaseStats, score: attempt.score});
                    });
                }
            });
        });
    }

    if(!queNumber){
        return res.status(406).json({err:"Question number is required"});
    }
    Question.findOne({number: queNumber}, (err,data)=>{

        if(err){
            console.log(err);
            return res.status(500).json({err:"Something went wrong"});
        }
        if(!data){
            return res.status(404).json({err:"No such question exists"});
        }
        data.attemptCount += 1;
        let lang = config[req.body.lang + "Key"] || 9;
        if(!req.files.file){
            return res.status(406).json({err:"Uploaded file is missing"});
        }
        let uploadedPath = req.files.file.path;
        let extName = path.extname(req.files.file.name);
        let epoch = (new Date()).getTime();
        let fileName = [teamName, queNumber, epoch.toString()].join("_");
        let newPath = path.join(__dirname, "../uploads/code/" + fileName + extName);
        let testCases = data.testcases;
        
        let attempt = {timestamp: timeStamp, questionNumber: queNumber, uploadedFilePath: newPath, testCaseStats: [], score: 0}
        try {
            
            fs.renameSync(uploadedPath, newPath);
            boxExec.on("error",()=>{
                return res.status(200).json({score:0, error: boxExec.errortext.message});
            });
            boxExec.on("success", ()=>{
                boxExec.execute();
            });
            boxExec.setData(lang, newPath, ...testCases);
            boxExec.on("output",()=>{
                for(var i = 0; i < testCases.length; i++){
                    let testCaseKey = testCases[i];
                    let output = data.output[i];
                    if(boxExec.output[testCaseKey].output.trim() === output.trim()){
                        attempt.testCaseStats[i] = true;
                        attempt.score += data.marking || 5;
                    } else{
                        attempt.testCaseStats[i] = false;
                    }
                }
                // console.log(attempt);
                createAttempt(attempt);
            });
            data.save();

        } catch(err){
            console.log(err);
            return res.status(500).json({err:"Something went wrong"});
        }

    });

});

router.get("/getAttempts", userPolicy, (req, res)=>{

    let teamName = res.locals.teamName;
    let queNumber = req.query.que;
    Team.aggregate([
        {
            $match:{name: teamName}
        }, 
        {
            $unwind: "$questions"
        },
        {
            $match:{"questions.number": parseInt(queNumber)}
        }
    ]).exec((err, data)=>{

        if(err){
            return res.status(500).json({err:"Something went wrong"});
        }
        let aIds = [];
        data.forEach((inst)=>{
            let attemptId = ObjectId(inst.questions.attempts[0]);
            aIds.push(attemptId);
        });
        Attempt.find({_id:{$in: aIds}}, {_id:0, __v:0, uploadedFilePath:0}, (err, data)=>{
            if(err){
                return res.status(500).json({err:"Something went wrong"});
            }
            return res.status(200).json({data, msg:"Data fetched successfully"});
        });

    });

});

module.exports = router;