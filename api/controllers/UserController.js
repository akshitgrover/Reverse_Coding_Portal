/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
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
	}
};

