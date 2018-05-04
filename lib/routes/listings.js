const router = require('express').Router();
const Listing = require('../models/listing');
const Image = require('../models/image');
const User = require('../models/user');
const checkAuth = require('../utils/check-auth');
const shortid = require('shortid');
const multer = require('multer');
const AWS = require('aws-sdk');
require('dotenv').config();

const multerOption = {
    storage: multer.memoryStorage(),
    fileFilter(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/');

        if(isPhoto) {
            next(null, true);
        } else {
            next({ message: 'That filetype isn’t allowed'});
        }
    }
};

AWS.config.update({
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
    region: 'us-west-2'
});

const upload = multer(multerOption).single('image');

const updateOptions = { 
    new: true,
    runValidators: true
};

module.exports = router
    .post('/:id/images', checkAuth(), upload, (req,res,next) => {
        User.findById(req.user.id)
            .then(user =>{
                if(!user.listings.find(listing=>listing.toString() === req.params.id)){
                    throw { code: 401, error: 'authentication failed, this is not your listing to post' };
                }
                const s3 = new AWS.S3();
        
                const uploadParams = {
                    Bucket: process.env.S3_BUCKET,
                    Key: `${shortid()}.${req.file.mimetype.split('/')[1]}`,
                    Expires: 60,
                    ContentType: req.file.mimetype,
                    ACL: 'public-read',
                    Body: req.file.buffer
                };

                s3.upload (uploadParams, function (err, data) {
                    if (err) {
                        next(err);
                    } 
                    if (data) {
                        Image.create({
                            imageURI: data.Location,
                            caption: req.body.caption
                        }).then( saved => {
                            return Listing.findByIdAndUpdate(req.params.id, {$push: { images: saved._id}}, updateOptions)
                                .then(() => res.send(saved));
                        });
                    }
                }); 
            })
            .catch(next);   
    })

    .delete('/:id/images/:imageId', checkAuth(), (req,res,next) => {
        User.findById(req.user.id)
            .then(user =>{
                if(!user.listings.find(listing=>listing.toString() === req.params.id)){
                    throw { code: 401, error: 'authentication failed, this is not your listing to delete' };
                }
                return Listing.findByIdAndUpdate(req.params.id, {$pull: { images: req.params.imageId}}, updateOptions)
                    .then( (response) => res.send({ removed: !!response }));
            })
            .catch(next); 
    })

    .post('/',checkAuth(), (req,res,next) => {
        req.body.postedBy = req.user.id;
        const list = new Listing(req.body);
        list.generateDate();
        list.save()
            .then(list => {
                return User.findByIdAndUpdate(req.user.id,{$push: { listings: list._id}}, updateOptions)
                    .then(()=> res.json(list));
            })
            .catch(next);
    })

    .get('/', (req,res,next) => {
        Listing.find()
            .lean()
            .populate('images')
            .populate('postedBy',{ name: 1, email: 1})
            .then(listings => res.json(listings))
            .catch(next);
    })

    .get('/:id', (req,res,next) => {
        const id = req.params.id;
        Listing.findById(id)
            .lean()
            .populate('images')
            .then(listing => {
                if(!listing) throw { 
                    code: 404, 
                    error: `listing ${id} does not exist`
                };
                res.send(listing);
            })
            .catch(next);
    })

    .put('/:id',checkAuth(), (req,res,next) => {
        const id = req.params.id;
        Listing.findByIdAndUpdate(id, req.body, updateOptions)
            .then(updated => {
                if(!updated) throw { 
                    code: 404, 
                    error: `listing ${id} does not exist`
                };
                res.send(updated);
            })
            .catch(next);
    })

    .delete('/:id',checkAuth(), (req,res,next) => {
        const id = req.params.id;
        Listing.findByIdAndRemove(id)
            .then(deleted => {
                if(!deleted) throw { 
                    code: 404, 
                    error: `listing ${id} does not exist`
                };
                res.send(deleted);
            })
            .catch(next);
    });