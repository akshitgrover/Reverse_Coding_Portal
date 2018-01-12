/**
 * QuestionController
 *
 * @description :: Server-side logic for managing questions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 * @baseurl 	:: https://reverse-coding-acm.herokuapp.com/
 */
var counter = 10;
var flag = -1;

module.exports = {
	create:function(req,res){
		User.findOne({username:req.param('username')},function(err,user){
			if(!user || err){
				return res.json(500,{err:"Invalid Username/Password."});
			}
			var bcrypt=require('bcrypt-nodejs');
			bcrypt.compare(req.param('password'),user.password,function(err,rest){
				if(!rest){
					return res.json(500,{err:"Invalid Username/Password."});
				}
				Question.create({number:req.param('number')},function(err,que){
					if(err){
						return res.json(500,{err:"Something Went Wrong."});
					}
					que.uploads={};
					que.fileexe = "files/q"+que.number+".exe";
					que.filejar = "files/q"+que.number+".jar";
					que.save();
					return res.json(200,{msg:"Successs"});
				});
			});
		});
	},
	upload:function(req,res){
		var token=req.headers.authorization.split(' ')[1];
		var flag=jwt.decode(token);
		Team.findOne({id:flag.id},function(err,user){
			var n=user.expiredtokens.indexOf(token);
			if(!user || n!=-1){
				return res.json(500,{err:"You Are Not Authorized, Login Again."});
			}
			Question.findOne({number:req.body.que},function(err,q){
				if(err){
					return res.json(500,{err:"Something Went Wrong. Please Upload Again."});
				}
				if(!q){
					return res.json(404,{err:"Question you are requesting is not found."});
				}
				var d = new Date();
				var time = d.getTime();
				var name = user.username+'_q'+req.body.que+"_"+time;
				var fs = require('fs');
				var path = require('path').resolve(sails.config.appPath,'uploads');
				req.file('upload').upload({dirname:path,saveAs:name},function(err,files){
					if(err){
						return res.json(500,{err:"Error Uploading File."});
					}
					var ext = require('path').extname(files[0].filename);
					var base = "";
					fs.renameSync(path+'/'+name,path+'/'+name+ext);
					user.uploads[req.body.que] = base+'/'+name+ext;
					user.marked[req.body.que] = 0; 
					user.save();
					q.uploads[user.username] = base+'/'+name+ext;
					q.save();
					return res.json(200,{msg:"Uploaded Successfully."});
				});
			});	
		});
	},
	download: function(req,res){
    	var fs = require('fs');
 		var fileName = req.param('path');
        fs.readFile(sails.config.appPath+'/uploads'+fileName, function(err , file) {
            if(err) {
                return res.json(500,{err:"Something Went Wrong While Downloading The File."});
            } 
            else {
            	var mime_type=require('mime-types');
            	var mime = mime_type.contentType(fileName);
            	var filename = fileName;
                res.set({
    				"Content-Disposition": 'attachment; filename="'+filename+'"',
    				"Content-Type": mime,
				});
                res.send(new Buffer(file));
            }
        });
    },
    getquefiles:function(req,res){
    	User.findOne({username:req.param('username')},function(err,user){
			if(!user || err){
				return res.json(500,{err:"No Such Record Of The User, Please Login."});
			}
			var bcrypt=require('bcrypt-nodejs');
			bcrypt.compare(req.param('password'),user.password,function(err,rest){
				if(!rest){
					return res.json(500,{err:"Invalid Username/Password."});
				}
				Team.find(function(err,data){
					if(err){
						return res.json(500,{err:"Something Went Wrong."});
					}
					var arr=[];
			    	Question.findOne({number:req.param('que')},function(err,q){
			    		if(err || !q){
			    			return res.json(500,{err:"Something Went Wrong, Please Try Again."});
			    		}
			    		data.forEach(function(item){
			    			arr.push(item.username);
			    		});
			    		return res.json(200,{filedetails:q.uploads,teamname:arr,quenum:req.param('que')});
			    	});
			    });
	    	});
	    });
    },
    getteamfiles:function(req,res){
		User.findOne({username:req.param('username')},function(err,user){
	    	if(!user || err){
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
		    		return res.json(500,{uploads:team.uploads,teamname:req.param('teamname')});
		    	});
    		});
    	});
    },
    getquestion:function(req,res){
    	var timer = new Date().getTime();
    	if(timer - flag > 10800000 && counter != 15 && flag != -1){
    		var inc = ((timer-flag)-((timer-flag)%10800000))/10800000;
    		counter += inc;
    		flag = timer;
    	}
      	Question.find({}).limit(counter).exec(function(err,ques){
      		if(err){
      			return res.json(500,{err:"Something Went Wrong."});
      		}
      	    var filesexe={};
      	    var filesjar={};
    		var base="";
    		ques.forEach(function(que){
				filesexe[que.number]=base+que.fileexe;
				filesjar[que.number]=base+que.filejar;
    		});
    		return res.json(200,{filesexe:filesexe,filesjar:filesjar});
    	});
    },
    start:function(req,res){
    	var bcrypt = require('bcrypt-nodejs');
    	User.findOne({username:req.param('username')},function(err,data){
    		console.log(data);
    		console.log("Error: " + err);
    		if(err){
    			return res.json(500,{});
    		}
    		if(!data || !bcrypt.compareSync(req.param('password'),data.password)){
    			return res.json(401,{});
    		}
    		flag = new Date().getTime();
    		console.log(flag);
    		return res.json(200,{startTime:flag});
    	});
    }
};

