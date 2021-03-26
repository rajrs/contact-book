const mongoose= require('mongoose')
const { Schema } = mongoose;

const placeSchema = new Schema({
    title:{type:String,required:true},
    description:{type:String,required:true},
    image:{type:String,required:true},
    location:{
        lat:{type:Number,required:true},
        lan:{type:Number,required:true}
    },
    creator:{type:Schema.Types.ObjectId,required:true,ref:'User'}
})
module.exports= mongoose.model('Place',placeSchema)