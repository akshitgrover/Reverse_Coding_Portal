/**
 * QuestionController
 *
 * @description :: Server-side logic for managing questions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	upload:function(req,res){
		Team.findOne({username:req.param('username')},function(err,user){
			if(!user){
				return res.json(500,{err:"No Such Team Found, Please Login With Correct Username."});
			}
			Question.findOne({number:req.param('que'),round:req.param('round')},function(err,q){
				if(!q){
					return res.json(500,{err:"Something Went Wrong. Please Upload Again."});
				}
				req.file('file').upload({adapter:require('skipper-gridfs'),uri:'mongodb://Deathadder:*******@ds123534.mlab.com:23534/reverse_coding_acm.fs'},function(err,files){
					console.log(err||files);
					if(req.param('round')=='one'){
						user.roundone[req.param('que')]=files[0].fd;
						user.save();			
						q.uploads[req.param('username')]=files[0].fd;
						q.save();
						console.log(q.uploads);
						console.log(user.roundone);
						return res.json(200,{msg:"Files Uploaded Successfully"});
					}
					else{
						return res.json(500,{err:'Something Went Wrong. Please Upload Again.'});
					}
				});
			});
		});
	},
	download: function(req,res){
    	var adapter = require('skipper-gridfs')({
        	uri: 'mongodb://Deathadder:*******@ds123534.mlab.com:23534/reverse_coding_acm.fs'
        });
        var fd = req.param('fd');
        adapter.read(fd, function(err , file) {
            if(error) {
                return res.json(500,{err:"Something Went Wrong While Downloading The File."});
            } 
            else {
                res.contentType('application/octet-stream');
                res.send(new Buffer(file));
            }
        });
    },
    getquefiles:function(req,res){
    	Question.findOne({number:req.param('que')},function(err,q){
    		if(err || !q){
    			return res.json(500,{err:"Something Went Wrong, Please Try Again."});
    		}
    		return res.json(200,{filedetails:q.uploads});
    	});
    },
    getteamfiles:function(req,res){
    	Team.findOne({username:req.param('username')},function(err,team){
    		if(err || !team){
    			return res.json(500,{err:"Something Went Wrong, Please Try Again."});
    		}
    		return res.json(500,{roundone:team.roundone,roundtwo:team.roundtwo});
    	});
    }
};

