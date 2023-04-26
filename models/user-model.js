const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        userID: Number,
        sessionID: String,
        userData: {
            avatar_url: String,
            country_code: String,
            default_group: String,
            id: Number,
            is_active: Boolean,
            is_bot: Boolean,
            is_deleted: Boolean,
            username: String,
            is_restricted: Boolean,
            global_rank: Number,
            country_rank: Number,
            badges: Number,
        }
    }
);
 
var userModel = mongoose.model('authenticated_user', userSchema);
 
module.exports = userModel;