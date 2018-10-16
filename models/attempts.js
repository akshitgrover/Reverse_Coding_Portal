const mongoose = require("mongoose");

const schema = mongoose.Schema;

const model = new schema({

    timestamp:{
        type:"string"
    },
    questionNumber:{
        type:"number",
        required: [true, "question number is required"]
    },
    uploadedFilePath:{
        type:"string",
        required: [true, "Uploaded file path is requried"]
    },
    testCaseStats:{
        type:"array",
        default:[false]
    },
    score:{
        type:"number",
        default: 0
    }

});

module.exports = mongoose.model("attempt", model);