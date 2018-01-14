/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 * @baseurl 	:: https://reverse-coding-acm.herokuapp.com/
 */

module.exports = {
	create:function(req,res){
		User.create({username:req.param('username')},function(err,user){
			if(err){
				console.log(err);
				return res.json(500,{err:"Something Went Wrong."});
			}
			var bcrypt=require('bcrypt-nodejs');
			user.password=bcrypt.hashSync(req.param('password'));
			user.confirmpassword=user.password;
			user.save();
			return res.json(200,{msg:"Success"});
		});
	},
	login:function(req,res){
		User.findOne({username:req.param('username')},function(err,user){
			if(err){
				return res.json(500,{err:"Something went wrong."});
			}
			if(!user || !bcrypt.compareSync(req.param('password'),user.password)){
				return res.json(404,{err:"No user found."});
			}
			return res.json(200,{msg:"Logged In"});
		});
	}
};

