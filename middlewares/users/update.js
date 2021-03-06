/**
 * @file update.js
 * @namespace Update User
 * @desc Update logic strategy
 */

var rek = require('rekuire');
var Account = rek('data/models/user/account');
var _ = require('underscore');
var mainSettings = rek('/settings');
var fs = require('fs');
var uuid = require('node-uuid');


/**
 * @desc  Method to update an user
 * @return object - Updated user
 */
function update(req, res, next) {
    var isAdmin = req.user.roles.indexOf('admin')+1;
    var isTheUser = req.user._id == req.body._id;
    var reqUser = req.body;
    
    if (!_.isEmpty(reqUser)) {
        if (isAdmin || isTheUser) {
            Account.findById(req.body._id)
                .exec(function(err, user) {
                    if (err) return res.send(err);
                    else {
                        if (!isAdmin) {
                            // Only admins can modify "roles" property
                            reqUser = _.without(user, 'roles');
                        }
                        _.extend(user, reqUser);
                        user.save();
                        req.object = _.pick(user, '_id', 'image', 'username', 'email', 'roles');
                        next();
                    }
                });
        } else {
            res.send({error: 'unauthorized'});
        }
    } else if (req.busboy) {



        if (isAdmin || isTheUser) {
            Account.findById(req.params.id)
                .exec(function(err, user) {
                    if (err) return res.send(err);
                    else {
                        req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
                            var dirPath = mainSettings.filesPath + 'users',
                                newPath = mainSettings.filesPath + 'users/' + uuid.v4(),
                                pathTreat = newPath.replace(process.cwd() + '/public', '');

                            fs.exists(dirPath, function (exists) {
                                if (exists) {
                                    user.image = pathTreat;
                                    file.pipe(fs.createWriteStream(newPath));
                                } else {
                                    fs.mkdir(dirPath, 0755, function(err) {
                                        if (!err) {
                                            user.image = pathTreat;
                                            file.pipe(fs.createWriteStream(newPath));
                                        }
                                    });
                                }
                            });
                        });
                        req.busboy.on('finish', function() {
                            user.save();
                            req.object = _.pick(user, '_id', 'image', 'username', 'email');
                            next();
                        });

                        req.pipe(req.busboy);
                    }
                });
        }












    } else {
        res.send({error: 'empty'});
    }
}

module.exports = update;