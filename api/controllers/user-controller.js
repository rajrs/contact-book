const {
    validationResult
} = require('express-validator');
const HttpError = require('../models/http-error');
const User = require('../models/user')

const getUsers = async(req, res, next) => {
let users;
try{ const users = await User.find({},'name email')}
catch(err){
    return next(new HttpError('Fetching users failed, please try again later', 500));  
}
res.json({data: users.map(user => user.toObject({getters:true}))})
   
}
const signup = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next(new HttpError('Invalid inputs passed, please check your data', 422));  
    }
    console.log(req.body);
    const {
        name,
        email,
        password,
       // places:[]
    } = req.body;
console.log({ name,email,password})
 
    let existingUser;
    try {
        existingUser = await User.findOne({
            email:email
        });
    } catch ( err) {
        console.log(err);
        const error = new HttpError('Signing up failed, please try again later', 500);
        return next(error);
    }
    if(existingUser){
        const error = new HttpError('User exists already , please login instead.',422 );
        return next(error);
    }
    const createdUser= new User({name, email,image:'empty-url',password,places:[]})

    try{
        await createdUser.save() 
    }
    catch(err){
        console.log(err);
        const error = new HttpError('Signing up failed, please try again later', 500);
        return next(error);
    }
    res.status(201).json({user:createdUser.toObject({getters:true})})
}

const login = async(req, res, next) => {
    const {email,password} =req.body;
console.log({email,password});
 let existingUser;
    try {
        existingUser = await User.findOne({
            email:email
        });
        console.log(existingUser)
 
    } catch ( err) {
        console.log(err);
        const error = new HttpError('Logging  in  failed, please try again later', 500);
        return next(error);
    }
    if(!existingUser){ 
        const error = new HttpError('email is not found, could not log you in.',401);
        return next(error);
    } else if (existingUser.password !== password){
        const error = new HttpError('Invalid credentials, could not log you in.',401);
        return next(error);
    }
    res.status(200).json({message:"Logged in"});
} 

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;