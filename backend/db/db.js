const mongoose = require ("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;
const mongo_url = process.env.mongo_url;

mongoose.connect(mongo_url);

const userSchema = new Schema({
    firstName : String,
    lastName : String,
    id : ObjectId,
    email : {type: String, unique : true}, 


}
)