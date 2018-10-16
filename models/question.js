const mongoose = require("mongoose");

const schema = mongoose.Schema;

const model = new schema({

    number:{
        type:"number",
        default: 1
    },
    executable:{
        type:"object"
    },
    output:{
        type:"array",
        required: [true, "Output string is required"]
    },
    testcases:{
        type:"array"
    },
    attemptCount:{
        type:"number",
        default: 0
    },
    marking:{
        type:"number",
        default: 5
    }

});

model.statics.insertInc = function(output, cb){
    
    this.aggregate([
        {
            $group: {
                _id: null,
                max: {$max: "$number"}
            }
        }
    ]).exec((err, data)=>{
    
        if(err){
            return cb(err);
        }
        let number = (data[0])? data[0].max || 0 : 0;
        let doc = {number: number + 1, output};
        this.create(doc, cb);

    });

}

module.exports = mongoose.model("question", model);