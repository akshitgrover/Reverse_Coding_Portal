const mongoose = require("mongoose");

const schema = mongoose.Schema;

const model = new schema({

    username:{
        type:"string",
        required: [true, "Username is required"],
        unique: [true, "Username is already taken"]
    },
    password:{
        type:"string",
        required:[true, "Password is required"] 
    }

});

module.exports = mongoose.model("admin", model);