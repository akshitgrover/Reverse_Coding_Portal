const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const teamSchema = new Schema({
    name:{
        type:String,
        unique:true,
        required:true
    },
    creater:
        {
            name:{
                type:String,
            },
            email:{
                type:String,
            }
        },
    member:
        {
            name:{
                type:String,
            },
            email:{
                type:String,
            }
        },
});

var team = mongoose.model('team',teamSchema);

module.exports = team;