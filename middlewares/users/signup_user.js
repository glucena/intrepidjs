/**
 * @file signup_user.js
 * @namespace Signup User
 * @desc Signup logic strategy
 */

var passport = require("passport"),
    rek = require('rekuire'),
    uuid = require('node-uuid'),
    Account = rek('data/models/user/account');

/**
 * @desc  Method to singup an user in the system
 * @param object $data - Data after validation process
 * @return object - Sanitized data
 */
function signupUser(req, res) {
    Account.register(
        new Account(
            {
                username: req.body.username,
                email: req.body.email,
                token: uuid.v4()
            }
        ),
        req.body.password,
        function(err, account) {
            if (err) {
                console.log(err);
            }

            passport.authenticate('local')(req, res, function() {
                res.redirect('/');
            });
        }
    );
}

module.exports = signupUser;