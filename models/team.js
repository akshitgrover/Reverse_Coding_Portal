const mongoose = require("mongoose");

const schema = mongoose.Schema;

const model = new schema({

    name:{
        type:"string"
    },
    score:{
        type:"number",
        default: 0
    },
    questions:[
            {
            number:{
                type:"number"
            },
            score:{
                type:"number",
                default:0
            },
            attempts:{
                type:"array",
                default:[]
            }
        }
    ]

});

module.exports = mongoose.model("teamAttempts", model);