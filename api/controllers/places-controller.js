const {
    validationResult
} = require('express-validator');
const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const Place = require('../models/place');
const User= require('../models/user');

const getPlaces = async (req, res, next) => {
    //console.log('getPlaces');   
    let result = await Place.find();
    //console.log(result)
    res.json(result)
}
const getPlaceById = async (req, res, next) => {
    console.log('getPlaceById');
    const placeId = req.params.placeId;    
    let place;
    try {
        place = await Place.findById(placeId)
    } catch (err) {
        console.log(err);
        const error = new HttpError('something went wrong, could not find a place', 500)
        return next(error);
    }
    if (!place) {
        const error = new HttpError('could not find a place for the provided id.', 404);
        return next(error)
    }
    res.json({
        placeId: req.params.placeId,
        place: place.toObject({
            getters: true
        })
    })
}
const getPlaceByUserId = async (req, res, next) => {
    //console.log('getPlaceByUserId');
    const userId = req.params.userId;
    //console.log(userId);
    let place;
    try {
        place = await Place.find({creator:userId})  
    } catch (err) {
        console.log(err);
        const error = new HttpError('something went wrong, could not find a place', 500)
        return next(error);
    }
    if (!place) {
        const error = new HttpError('could not find a place for the provided id.', 404);
        return next(error)
    }
    res.json({
        userId: req.params.userId,
        place: place.map( data => data.toObject({getters: true}))
       
    })

}
const createPlace = async (req, res, next) => {
    console.log('in req');
    const err = validationResult(req)
    if (!err.isEmpty()) {
        console.log('err from validationResult');
        console.log(err);
        res.status(422);
        throw new HttpError('invalid inputs', 422)
    }
    const {
        title,
        description,
        coordinates,
        address,
        image,
        creator
    } = req.body;
     
    console.log({
        title,
        description,
        coordinates,
        image,
        creator
    })
    const createPlace = new Place({  
        title,
        description,
        location: coordinates,
        image,
        creator
    });

    let user;
    try{ 
        user = await User.findById(creator)
    }
    catch(err){
        const error = new HttpError('Creating plade failed, Please try again',500);
        return next(error)
    }
    if(!user){
        const error = new HttpError('Could not fine user for provided id',404);
        return next(error)
    }
    try {
        const session = await mongoose.startSession()
        session.startTransaction();
        await createPlace.save({session})
        user.places.push(createPlace)
        await user.save({session})
        await session.commitTransaction();
    } catch (err) {
        console.log(err);
        return next()
    }
    res.status(201).json({
        message: 'place created sucessfully'
    })
}
const updatePlace = async(req, res, next) => {
    const placeId = req.params.placeId;
    const{title,description}= req.body;
    let place;

    //try{ 
        place = await Place.findOneAndUpdate({"_id":placeId},{$set:{title,description}},{new: true},(err,doc)=>{

            if (err) { 
                console.log("Something wrong when updating data!");
                const error = new HttpError('something went wrong , could not update place,',500)
                return next(error)
            } 
            console.log(doc)
            //res.status(200).json({place:place.toObject({getters:true})})
            res.status(200).json({place: doc, message:"record updated successfully"})
        });
    //}
    // catch(err){
    //     const error = new HttpError('something went wrong , could not update place,',500)
    // return next(err)
    // }
    // place.title = title;
    // place.description=description;

    // try{
    //     await place.save()
    // }
    // catch(err){
    //     const error = new HttpError('something went wrong , could not update place,',500)
    // return next(err)
    // }
    // res.status(200).json({place:place.toObject({getters:true})})
}
const deletePlaces = async(req, res, next) => {

    const placeId = req.params.placeId;
    let place;
    try{
       //place=  await  Place.findByIdAndDelete(placeId).populate('creator')
       place = await Place.findById(placeId).populate('creator','places');
       console.log(place)
    } 
    catch(err){        
        const error = new HttpError('something went wrong , could not delete place,',500)
        return next(error)
    }
   if(!place){
    const error = new HttpError('Could not find place for this id,',404)
    return next(error)
   }
    try{ 
        const session = await mongoose.startSession();
        session.startTransaction();
        await  place.remove({session});
        place.creator.places.pull(place);
        await place.creator.save({session})
        await session.commitTransaction();
    }
    catch(err){
        const error = new HttpError('something went wrong , could not delete place,',500)
    return next(err)
    }
    // try{
    //     await place.remove()
    // }
    // catch(err){
    //     const error = new HttpError('something went wrong , could not delete place,',500)
    // return next(err)
    // }
     res.status(200).json({message:"place deleted sucessfully"})
}

exports.getPlaces = getPlaces;
exports.getPlaceByUserId = getPlaceByUserId;
exports.getPlaceById = getPlaceById;
exports.createPlace = createPlace; 
exports.updatePlace = updatePlace;
exports.deletePlaces = deletePlaces; 