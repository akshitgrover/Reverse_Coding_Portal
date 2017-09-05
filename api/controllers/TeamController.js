/**
 * TeamsController
 *
 * @description :: Server-side logic for managing teams
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	'up':function(req,res){
		res.view();
	},
	create:function(req,res){
		if(req.param('password')!=req.param('confirmpassword')){
			return res.json(500,{err:"Passwords Didn't Match."});
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
			data.save();
			console.log(data);
			return res.json(200,{message:"Success."});
		});
	},
	login:function(req,res){
		Team.findOne({username:req.param('username')},function(err,data){
			if(err){
				return res.json(500,{err:"Something Went Wrong."});
			}
			if(data){
				console.log(data);
				var bcrypt=require('bcrypt-nodejs');
				bcrypt.compare(req.param('password'),data.password,function(err,rest){
					console.log(data.password);
					if(rest){
						return res.json(200,{message:"Logged In Successfully."});
					}
					else{
						return res.json(200,{err:"Invalid Username/Password."});
					}
				});
			}
			else{
				res.json(200,{err:"Invalid Username/Password."})
			}
		});
	}
};

