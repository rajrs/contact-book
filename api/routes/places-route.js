const express = require('express');
const {check } =require('express-validator')

const router = express.Router();
const placesController = require('../controllers/places-controller');


router.get('/',placesController.getPlaces);
router.get('/:placeId',placesController.getPlaceById);
router.get('/user/:userId',placesController.getPlaceByUserId);



router.post('/',[check('title').not().isEmpty(),check('description').isLength({min:5})],placesController.createPlace);
router.patch('/:placeId',placesController.updatePlace);
router.delete('/:placeId',placesController.deletePlaces);
module.exports = router; 