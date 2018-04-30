const router = require('express').Router();
const Listing = require('../models/listing');
const User = require('../models/user');
const checkAuth = require('../utils/check-auth');

const updateOptions = { 
    new: true,
    runValidators: true
};

module.exports = router
    .post('/',checkAuth(), (req, res, next) => {
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
            .populate('postedBy',{ name: 1, email: 1})
            .then(listings => res.json(listings))
            .catch(next);
    })

    .get('/:id', (req,res,next) => {
        const id = req.params.id;
        Listing.findById(id)
            .lean()
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