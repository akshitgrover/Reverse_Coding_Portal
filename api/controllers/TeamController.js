/**
 * TeamsController
 *
 * @description :: Server-side logic for managing teams
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 * @baseurl 	:: https://reverse-coding-acm.herokuapp.com/
 */

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
					console.log(err);
					return res.json(500,{err:"Something Went Wrong."});
				}
				var bcrypt=require('bcrypt-nodejs');
				data.password=bcrypt.hashSync(req.param('password'));
				data.confirmpassword=data.password;
				data.email=req.param('email');
				data.phoneno=req.param('phoneno');
				data.expiredtokens=[];
				data.roundone={};
				data.roundtwo={};
				data.save();
				console.log(data);
				return res.json(200,{message:"Success."});
			});
		});
	},
	login:function(req,res){
		Team.findOne({username:req.param('username')},function(err,data){
			if(err){
				return res.json(500,{err:"Something Went Wrong."});
			}
			if(data){
				var bcrypt=require('bcrypt-nodejs');
				console.log(bcrypt.hashSync(req.param('password')));
				//console.log(data);
				bcrypt.compare(req.param('password'),data.password,function(err,rest){
					console.log(data.password);
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
	}	
};

