/**
 * QuestionController
 *
 * @description :: Server-side logic for managing questions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 * @baseurl 	:: https://reverse-coding-acm.herokuapp.com/
 */

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
		var token=req.headers.authorization.split(' ')[1];
		var flag=jwt.decode(token);
		Team.findOne({id:flag.id},function(err,user){
			var n=user.expiredtokens.indexOf(token);
			if(!user || n!=-1){
				return res.json(500,{err:"You Are Not Authorized, Login Again."});
			}
			Question.findOne({number:req.param('que'),round:req.param('round')},function(err,q){
				if(err){
					return res.json(500,{err:"Something Went Wrong. Please Upload Again."});
				}
				if(!q){
					return res.json(404,{err:"Question you are requesting is not found."});
				}
				req.file('file').upload({adapter:require('skipper-gridfs'),uri:'mongodb://Deathadder:Deathadder_11@ds123534.mlab.com:23534/reverse_coding_acm.fs'},function(err,files){
					console.log(err||files);
					if(files==[]){
						return res.json(404,{err:"Please Upload The File."})
					}
					if(err){
						return res.json(500,{err:"Something Went Wrong."});
					}
					var adapter = require('skipper-gridfs')({
        				uri: 'mongodb://Deathadder:Deathadder_11@ds123534.mlab.com:23534/reverse_coding_acm.fs'
        			});
					if(req.param('round')=='one'){
						if(user.roundone[req.param('que')]){
							adapter.rm(user.roundone[req.param('que')],function(err,data){
								if(err){
									return res.json(500,{err:"Something Went Wrong Please Upload Again."});
								}
								user.roundone[req.param('que')]=files[0].fd;
								user.save();			
								q.uploads[user.username]=files[0].fd;
								q.save();
								//console.log(q.uploads);
								//console.log(user.roundone);
								return res.json(200,{msg:"Files Uploaded Successfully."});
							});
							return;
						}
						user.roundone[req.param('que')]=files[0].fd;
						user.save();			
						q.uploads[user.username]=files[0].fd;
						q.save();
						console.log(q.uploads);
						console.log(user.roundone);
						return res.json(200,{msg:"Files Uploaded Successfully."});
					}
					else if(req.param('round')=='two'){
						console.log(user.roundtwo[req.param('que')]);
						if(user.roundtwo[req.param('que')]){
							console.log("TEST");
							adapter.rm(user.roundtwo[req.param('que')],function(err,data){
								if(err){
									console.log("err");
									return res.json(500,{err:"Something Went Wrong Please Upload Again."});
								}
								//console.log(data);
								//console.log("File Deleted");
								user.roundtwo[req.param('que')]=files[0].fd;
								user.save();			
								q.uploads[user.username]=files[0].fd;
								q.save();
								//console.log(q.uploads);
								//console.log(user.roundone);
								return res.json(200,{msg:"Files Uploaded Successfully."});
							});
							return;
						}
						//console.log("parent");
						user.roundtwo[req.param('que')]=files[0].fd;
						user.save();
						q.uploads[user.username]=files[0].fd;
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
	},
	download: function(req,res){
    	var adapter = require('skipper-gridfs')({
        	uri: 'mongodb://Deathadder:Deathadder_11@ds123534.mlab.com:23534/reverse_coding_acm.fs'
        });
        var fd = req.param('fd');
        adapter.read(fd, function(err , file) {
            if(err) {
                return res.json(500,{err:"Something Went Wrong While Downloading The File."});
            } 
            else {
            	var mime_type=require('mime-types');
            	var mime = mime_type.contentType(fd);
            	var id = fd.indexOf('.');
            	var ext=fd.slice(id);
            	var filename = req.param('teamname')+'_'+req.param('que')+'_'+req.param('round')+ext;
                console.log(filename);
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
			    	Question.findOne({number:req.param('que'),round:req.param('round')},function(err,q){
			    		if(err || !q){
			    			return res.json(500,{err:"Something Went Wrong, Please Try Again."});
			    		}
			    		data.forEach(function(item){
			    			arr.push(item.username);
			    		});
			    		return res.json(200,{filedetails:q.uploads,teamname:arr,quedet:{number:req.param('que'),round:req.param('round')}});
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
		    		return res.json(500,{roundone:team.roundone,roundtwo:team.roundtwo,teamname:req.param('teamname')});
		    	});
    		});
    	});
    },
    getquestion:function(req,res){
      	Question.find(function(err,ques){
      		if(err){
      			return res.json(500,{err:"Something Went Wrong."});
      		}
      	    var roundoneexe={};
      	    var roundonejar={};
      	    var roundtwoexe={};
    		var roundtwojar={};
    		var base="https://reverse-coding-acm.herokuapp.com/";
    		ques.forEach(function(que){
    			if(que.round=="one"){
    				roundoneexe[que.number]=que.fileexe;
    				roundonejar[que.number]=que.filejar;
    				console.log(roundone);
    			}
    			else{
    				roundtwoexe[que.number]=que.fileexe;
    				roundtwojar[que.number]=que.filejar;
    				console.log(roundtwo);
    			}
    		});
    		return res.json(200,{queroundoneexe:roundoneexe,queroundonejar:roundonejar,queroundtwoexe:roundtwoexe,queroundtwojar:roundtwojar});
    	});
    }
};

