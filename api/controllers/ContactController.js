/**
 * ContactController
 *
 * @description :: Server-side logic for managing contacts
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	
    
	
    'new': function (req, res) {
        Cogroup.findOne(req.param('id'))
            .populate('branches')
            .exec(function (err, cogroup) {
                if (err) res.json({
                    error: err.message
                }, 400);

                res.view({ cogroup: cogroup });
            });
    },
    
    
    create: function (req, res, next) {
//        console.log(req.params.all());

        var contactObj = {
            name: req.param('name'),
            group: req.param('group'),
            branch: req.param('branch'),
            position: req.param('position'),
            phone: req.param('phone'),
            fax: req.param('fax'),
            email: req.param('email'),
            note: req.param('note')
        };

        // Create a User with the params sent from 
        // the sign-up form --> new.ejs
        Contact.create(contactObj, function(err, contact) {

            // If there's an error
            if (err) {
                console.log(err);
                // If error redirect back to creation page
                return res.redirect('/contact/new/' + contactObj.group);
            }
            console.log(contact);

            res.redirect('/cogroup/show/' + contactObj.group);
        });
    },
    
    'edit': function (req, res) {
        // console.log('CONTACT_EDIT', req.params.all(), req.param('id'));
        Contact.findOne(req.param('id'))
            .exec(function (err, contact) {
                if (err) res.json({
                    error: err.message
                }, 400);
            
                console.log('FOUND THIS:', contact);
            
                res.view({ contact: contact });
            });
    },

    update: function (req, res, next) {
        // console.log('BRANCH_UPDATE');
        var id = req.param('id'),
            updates = {
                name: req.param('name'),
                group: req.param('group'),
                branch: req.param('branch'),
                position: req.param('position'),
                phone: req.param('phone'),
                fax: req.param('fax'),
                email: req.param('email'),
                note: req.param('note')
            };

        Contact.update(id, updates)
            .exec(function(err, contact) {
                if (err) return err;
            
                req.flash('message', 'Record Updated!');
                res.redirect('/contact/edit/' + id);
            });
    },

    destroy: function (req, res, next) {
        var delRecord = req.param('id');
        Contact.destroy(delRecord).exec(function (err, contact) {
            if (err) res.json({
                error: err.message
            }, 400);

            res.redirect('/cogroup/show/' + contact[0].group);
        });
    },
    // Process updates, creation and deletions from "cogroup/show" page.
    merge: function (req, res, next) {
        console.log('CONTACTS MERGE:\n', req.params.all());
        var co_name = req.param('id'),
            contactList = req.param('contactList'),
            deleteIDs = req.param('deleteIDs');
        
        for (var i=0; i<contactList.length; i++) {
            // Update contact in database.
            Contact.update({id: contactList[i].id, group: co_name}, contactList[i])
            .exec(function (err, contact) {
                console.log('CONTACT UPDATE:', err, contact);
            });
            // Add contact to database if it doesn't exist.
            Contact.findOrCreate({id: contactList[i].id, group: co_name}, contactList[i])
            .exec(function (err, contact) {
                console.log('CONTACT FINDorCREATE:', err, contact);
            });
        }
        if (deleteIDs instanceof Array && deleteIDs.length > 0) {
            for (var i=0; i<deleteIDs.length; i++) {
                if (!isNaN(parseInt(deleteIDs[i]))) {
                    // Delete contact from database.
                    Contact.destroy({id: deleteIDs[i], group: co_name})
                    .exec(function (err, contact) {
                        console.log('CONTACT DESTROY:', err, contact);
                    });
                }
            }
        }
        
        res.send(true);
    },
    
    contactList: function (req, res, next) {
        var co_name = req.param('id');
        
        Contact.find({group: co_name}, function (err, contacts) {
//            console.log(err, contacts);
            res.send(contacts);
        });
    }
    
};

