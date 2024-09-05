import mongoose from "mongoose";

const userSSchema = new Schema({
    username:{
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model('user', userSSchema);

export default User;