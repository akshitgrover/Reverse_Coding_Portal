const express = require("express");

const router = express.Router();

const Team = require("./../models/team.js");

const adminPolicy = require("./../policies/admin.js");

router.post("/add", adminPolicy, (req, res)=>{

    Team.create({name: req.body.name}, (err, data)=>{
        
        if(err){
            return res.status(500).json({err:"Something went wrong"});
        }
        return res.status(200).json({msg:"Team added successfully"});

    });

});

router.get("/", adminPolicy, (req, res)=>{

    Team.aggregate([
        {
            $match:{name: "akshitgrover"}
        },
        {
            $unwind: "$questions"
        },
        {
            $match:{"questions.number": 2}
        },
        {
            $sort: {"questions.score": -1}
        },
        {
            $limit:1
        },
    ]).exec((err, data)=>{
        if(err){
            console.log(err);
            return res.status(500).json({err:"Something went wrong"});
        }
        console.log(data);
        let obj = data[0];
        console.log(obj);
    });

});

router.get("/leaderboard", (req, res)=>{

    let page = req.query.page || 1;
    let limit = req.query.limit || 25;
    Team.countDocuments((err, data)=>{
        let count = data;
        Team.find({}, {questions:0, _id:0, __v:0}).sort({score:-1}).skip((page - 1) * limit).limit(limit).exec((err, data)=>{

            if(err){
                return res.status(500).json({err:"Something went wrong"});
            }
            return res.status(200).json({data:data, totalDocs: count, totalPages: Math.ceil(count / limit), page:page, msg:"Leaderbord fetched successfully"});

        });
    });

});

module.exports = router;