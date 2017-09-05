/**
 * Question.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	number:{
  		type:'string',
  		required:true
  	},
  	file:{
  		type:'string',
  		required:true
  	},
    round:{
      type:'string',
      required:true
    },
  	uploads:{
  		type:'object',
  		defaultsTo:{}
  	}
  }
};

