const router = require('express').Router();
const User = require('../models/user');
const tokenService = require('../utils/token-service');
const checkAuth = require('../utils/check-auth');

module.exports = router
    .post('/signup', (req,res,next) => {
        const { password, email } = req.body;
        delete req.body.password;

        if (!password) throw { code:400, error: 'password is required!'};

        User.emailExists(email)
            .then( exists => {
                if (exists) throw { code: 400, error: 'this email is already taken'};

                const user = new User(req.body);
                user.generateHash(password);
                return user.save();
            })
            .then(user => tokenService.sign(user))
            .then(token => {
                return res.send({token});
            })
            .catch(next);
    })

    .post('/signin', (req,res,next) => {
        const { email, password } = req.body;
        delete req.body.password;

        if(!password) throw { code: 400, error: 'password is required'};
        
        User.findOne({ email })
            .then(user => {
                if(!user || !user.comparePassword(password)) {
                    throw { code: 401, error: 'authentication failed' };
                }
                return user;
            })
            .then(user => tokenService.sign(user))
            .then(token => res.send({token}))
            .catch(next);
    })

    .get('/verify', (req, res) => {
        res.json(req.user.id);
    })

    .get('/me', checkAuth(), (req, res, next) => {
        User.findById(req.user.id)
            .lean()
            .populate({ path: 'listings'})
            .then(user => res.json(user))
            .catch(next); 
    });