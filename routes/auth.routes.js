
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const UserModel = require('../models/User.model')


// validate user input

const validate = (req, res, next) => {
    let username = req.body.username
    let password = req.body.password

    if (!username || !password) {
        res.render('auth/signup', {msg: 'please fill all fields'})
        return
    }
    else {
        next()
    }
}

// check authorization

const checkLoggedInUser = (req, res, next) => {
    if(req.session.loggedInUser) {
        next()
    }
    else {
        res.redirect('/login')
    }
}


// SIGNUP ROUTES

router.get('/signup', (req, res, next) => {
    res.render('auth/signup.hbs')
})


router.post('/signup', validate, (req, res, next) => {
    const {username, password} = req.body
    let salt = bcrypt.genSaltSync(10)
    let hash = bcrypt.hashSync(password, salt)

    let regexPass = /(?=.*[0-9])/
    if (!regexPass.test(password) ) {
        res.render('auth/signup', {msg: 'password too weak'})
        return
    }

  UserModel.findOne({username : username})
    .then(user => {
        if (user) {
            res.render('auth/signup', {msg: 'Username already exists'})
        }
        else {
            UserModel.create({ username, password: hash })
            .then(() => {
                res.render('private', {msg: `Hello ${username} You have just signed up`})
            })
            .catch((err) => {
                next(err)
            })
        }
    })
    .catch((err) => {
        console.log(err)
    })

  });


  // LOGIN ROUTES

router.get('/login', (req, res) => {
    res.render('auth/login.hbs')
})


router.post('/login', validate, (req, res, next) => {

    const {username, password} = req.body

    UserModel.findOne({username: username})
    .then(result => {
        if (result) {
            // username exists
            bcrypt.compare(password, result.password)
            .then(isMatch => {
                if (isMatch) {
                    req.session.loggedInUser = result
                    res.redirect('/main')
                }
                else {
                    res.render('auth/login.hbs', {msg: 'incorrect pwd'})
                }
            })
        }
        else {
                 // username doesn't exist
            res.render('auth/login.hbs', {msg: 'username not found' })
        }
    })
    .catch((err) => {
        console.log('shit went wrong')
    })
})

// LOGOUT 

router.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})



// Protected routes

router.get('/main', checkLoggedInUser, (req, res) => {
    let username = req.session.loggedInUser.username
    res.render('main', {username, msg: `welcome back, ${username}`})
})


router.get('/private', checkLoggedInUser, (req, res) => {
    let username = req.session.loggedInUser.username
    res.render('private', {username, msg: `Hello ${username}`})
})



module.exports = router