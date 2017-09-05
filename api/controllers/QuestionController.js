/**
 * QuestionController
 *
 * @description :: Server-side logic for managing questions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	create:function(req,res){
		User.findOne({username:req.param('username')},function(err,user){
			if(!user){
				return res.json(500,{err:"Invalid Username/Password."});
			}
			var bcrypt=require('bcrypt-nodejs');
			bcrypt.compare(req.param('password'),user.password,function(err,rest){
				if(!rest){
					return res.json(500,{err:"Invalid Username/Password."});
				}
				Question.create({number:req.param('number')},function(err,que){
					console.log(err);
					if(err){
						return res.json(500,{err:"Something Went Wrong."});
					}
					que.round=req.param('round');
					que.save();
					return res.json(200,{msg:"Successs"});
				});
			});
		});
	},
	upload:function(req,res){
		Team.findOne({username:req.param('username')},function(err,user){
			var n=user.expiredtokens.indexOf(req.param('token'));
			if(!user || n!=-1){
				return res.json(500,{err:"You Are Not Authorized, Login Again."});
			}
			var bcrypt=require('bcrypt-nodejs');
			bcrypt.compare(req.param('password'),user.password,function(err,rest){
				if(!rest){
					return res.json(500,{err:"Invalid Username/Password."});
				}
				Question.findOne({number:req.param('que'),round:req.param('round')},function(err,q){
					if(!q){
						return res.json(500,{err:"Something Went Wrong. Please Upload Again."});
					}
					req.file('file').upload({adapter:require('skipper-gridfs'),uri:'mongodb://Deathadder:Deathadder_11@ds123534.mlab.com:23534/reverse_coding_acm.fs'},function(err,files){
						console.log(err||files);
						if(err){
							return res.json(500,{err:"Something Went Wrong."});
						}
						if(req.param('round')=='one'){
							user.roundone[req.param('que')]=files[0].fd;
							user.save();			
							q.uploads[req.param('username')]=files[0].fd;
							q.save();
							console.log(q.uploads);
							console.log(user.roundone);
							return res.json(200,{msg:"Files Uploaded Successfully."});
						}
						else if(req.param('round')=='two'){
							user.roundtwo[req.param('que')]=files[0].fd;
							user.save();
							q.uploads[req.param('username')]=files[0].fd;
							q.save();
							console.log(q.uploads);
							console.log(user.roundtwo);
							return res.json(200,{msg:"Files uploaded Successfully."});
						}
						else{
							return res.json(500,{err:'Something Went Wrong. Please Upload Again.'});
						}
					});
				});
			});	
		});
	},
	download: function(req,res){
    	var adapter = require('skipper-gridfs')({
        	uri: 'mongodb://Deathadder:Deathadder_11@ds123534.mlab.com:23534/reverse_coding_acm.fs'
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
    	User.findOne({username:req.param('username')},function(err,user){
			if(!user){
				return res.json(500,{err:"No Such Record Of The User, Please Login."});
			}
			var bcrypt=require('bcrypt-nodejs');
			bcrypt.compare(req.param('password'),user.password,function(err,rest){
				if(!rest){
					return res.json(500,{err:"Invalid Username/Password."});
				}
		    	Question.findOne({number:req.param('que'),round:req.param('round')},function(err,q){
		    		if(err || !q){
		    			return res.json(500,{err:"Something Went Wrong, Please Try Again."});
		    		}
		    		return res.json(200,{filedetails:q.uploads});
		    	});
	    	});
	    });
    },
    getteamfiles:function(req,res){
		User.findOne({username:req.param('username')},function(err,user){
	    	if(!user){
	    		return res.json(500,{err:"Invalid Username/Password."});
	    	}
	    	var bcrypt=require('bcrypt-nodejs');
	    	bcrypt.compare(req.param('password'),user.password,function(err,rest){
	    		if(!rest){
	    			return res.json(500,{err:"Invalid Username/Password."});
	    		}
		    	Team.findOne({username:req.param('teamname')},function(err,team){
		    		if(err || !team){
		    			return res.json(500,{err:"Something Went Wrong, Please Try Again."});
		    		}
		    		return res.json(500,{roundone:team.roundone,roundtwo:team.roundtwo});
		    	});
    		});
    	});
    },
    getquestion:function(req,res){
    	var roundone={};
    	var roundtwo={};
    	var base="localhost:1337/"
    	Question.find(function(err,ques){
    		ques.forEach(function(que){
    			if(que.round=="one"){
    				roundone[que.number]=base+"/assets/files/"+que.number;
    				console.log(roundone);
    			}
    			else{
    				//roundone[que.number]=base+que.file;
    			}
    		});
    	});
    }
};

