const mongoose = require('mongoose');

const Schema = mongoose.Schema


const userSchema = new Schema(
    {
        username : {
            type: String,
            required : true,
            unique : true,
        },
        name : {
            type : String,
            required : true
        },
        email : {
            type : String,
            required : true,
            unique : true,
        },
        password : {
            type : String,
            required : true,
        },
        profilePhoto: { 
            type: String, 
            default: null 
        },
        profileCoverImage: { 
            type: String, 
            default: null 
        },
        bio : {
            type: String,
            default: ""
        },

        location : {
            type: String,
            default: ""
        },

        website : {
            type: String,
            default: ""
        },
        dob:{
            type : String,
            default: null
        }

    },
    { timestamps: true } 
)



module.exports = mongoose.model("User", userSchema);