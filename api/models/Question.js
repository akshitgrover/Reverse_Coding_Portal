/**
 * Question.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	round:{
  		type:'string',
  		required:true
  	},
  	number:{
  		type:'string',
  		required:true
  	},
  	file:{
  		type:'string',
  		reuired:true
  	},
  	uploads:{
  		type:'array',
  		defaultsTo:[]
  	}
  }
};

