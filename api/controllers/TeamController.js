/**
 * TeamsController
 *
 * @description :: Server-side logic for managing teams
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 * @baseurl 	:: https://reverse-coding-acm.herokuapp.com/
 */
var flag = -1;

module.exports = {
	'up':function(req,res){
		res.view();
	},
	create:function(req,res){
		if(req.param('password')!=req.param('confirmpassword')){
			return res.json(500,{err:"Passwords Didn't Match."});
		}
		Team.findOne({username:req.param('username')},function(err,data){
			if(err){
				return res.json(500,{err:"Something Went Wrong."});
			}
			if(data){
				return res.json(200,{err:"Username Already Exists."});
			}
			Team.create({username:req.param('username')},function(err,data){
				if(err){
					return res.json(500,{err:"Something Went Wrong."});
				}
				var bcrypt=require('bcrypt-nodejs');
				data.password=bcrypt.hashSync(req.param('password'));
				data.confirmpassword=data.password;
				data.email=req.param('email');
				data.phoneno=req.param('phoneno');
				data.marked = {};
				data.qscores = {};
				data.score = 0;
				data.expiredtokens=[];
				data.save();
				return res.json(200,{message:"Success."});
			});
		});
	},
	login:function(req,res){
		if(flag != 1){
			return res.json(409,{err:"Cannot login, Wait for quiz to start."});
		}
		Team.findOne({username:req.param('username')},function(err,data){
			if(err){
				return res.json(500,{err:"Something Went Wrong."});
			}
			if(data){
				var bcrypt=require('bcrypt-nodejs');
				//console.log(data);
				bcrypt.compare(req.param('password'),data.password,function(err,rest){
					if(rest){
						return res.json(200,{message:"Logged In Successfully.",token:jwt.issue({id:data.id})});
					}
					else{
						return res.json(200,{err:"Invalid Username/Password."});
					}
				});
			}
			else{
				console.log('Error');
				res.json(200,{err:"Invalid Username/Password."})
			}
		});
	},
	logout:function(req,res){
		Team.findOne({username:req.param('username')},function(err,team){
			if(err){
				return res.json(500,{err:"Something Went Wrong."});
			}
			team.expiredtokens=[];
			team.expiredtokens.push(req.param('token'));
			team.save();
			return res.json(200,{msg:"Logged Out Successfully."});
		});
	},
	getdetails:function(req,res){
		User.findOne({username:req.param('username')},function(err,user){
			if(err || !user){
				return res.json(500,{err:"Something Went Wrong."});
			}
			var bcrypt=require('bcrypt-nodejs');
			bcrypt.compare(req.param('password'),user.password,function(err,rest){
				if(!rest){
					return res.json(500,{err:"Invalid Username/Password."});
				}
				Team.find(function(err,teams){
					if(err){
						return res.json(500,{err:"Something Went Wrong."});
					}
					var array=[];
					teams.forEach(function(team){
						array.push({teamname:team.username,phoneno:team.phoneno,email:team.email});
					});
					return res.json(200,{teams:array});
				});
			});
		});
	},
	getscore:function(req,res){
		Team.find({}).sort('score DESC').exec(function(err,data){
			if(err){
				return res.json(500,{err:"Something Went Wrong."});
			}
			var arr = data.map(function(inst){
				return {teamname:inst.username,score:inst.score};
			});
			return res.json(200,{data:arr});
		});
	},
	putscore:function(req,res){
		User.findOne({username:req.param('username')},function(err,data){
			if(err){
				return res.json(500,{err:"Something went wrong."});
			}
			var bcrypt = require('bcrypt-nodejs');
			if(!data || !bcrypt.compareSync(req.param('password'),data.password)){
				return res.json(401,{err:"Not Authorized."});
			}
			Team.findOne({username:req.param('teamname')},function(err,data){
				if(err){
					return res.json(500,{err:"Something went wrong."});
				}
				if(!data){
					return res.json(404,{err:"No team found."});
				}
				if(!data.qscores[req.param('que')]){
					data.qscores[req.param('que')] = [];
				}
				if(data.marked[req.param('que')] != 0){
					return res.json(409,{err:"Cannot give score for this question"});
				}
				data.qscores[req.param('que')].push(parseInt(req.param('score')));
				data.marked[req.param('que')] = 1;
				var flag = 0;
				var count = 0;
				Object.keys(data.qscores).forEach(function(inst){
					count++;
					console.log(count);
					console.log(Object.keys(data.qscores).length);
					flag += Math.max(...data.qscores[inst]);
					if(count == Object.keys(data.qscores).length){
						data.score = flag;
						data.save();
						console.log(data.score);
						return res.json(200,{msg:"Score increased"});
					}
				});				
			});
		});
	},
	marked:function(req,res){
		User.findOne({username:req.param('username')},function(err,data){
			if(err){
				return res.json(500,{err:"Something went wrong."});
			}
			var bcrypt = require('bcrypt-nodejs');
			if(!data || !bcrypt.compareSync(req.param('password'),data.password)){
				return res.json(401,{err:"Not Authorized."});
			}
			Team.findOne({username:req.param('teamname')},function(err,team){
				if(err){
					return res.json(500,{err:"Something went wrong."});
				}
				if(!team){
					return res.json(404,{err:"No team found."});
				}
				if(Object.keys(team.marked).length == 0){
					return res.json(200,{msg:"No more submissions to check."});
				}
				var flag = {};
				var count = 0;
				Object.keys(team.marked).forEach(function(inst){
					count++;
					if(team.marked[inst] == 0){
						flag[inst] = team.uploads[inst];
					}
					if(Object.keys(team.marked).length == count){
						return res.json(200,{data:flag});
					}
				});
			});
		});
	},
	start:function(req,res){
		var bcrypt = require('bcrypt-nodejs');
		User.findOne({username:req.param('username')},function(err,data){
			if(err || !data || !bcrypt.compareSync(req.param('password'),data.password)){
				return res.json(500,{err:"Error, Cannot Proceed."});
			}
			flag = 1;
			return res.json(200,{msg:"Started"});
		});
	}	
};

