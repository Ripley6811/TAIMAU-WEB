/**
 * ContactController
 *
 * @description :: Server-side logic for managing contacts
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {



//    'new': function (req, res) {
//        Cogroup.findOne(req.param('id'))
//            .populate('branches')
//            .exec(function (err, cogroup) {
//                if (err) res.json({
//                    error: err.message
//                }, 400);
//
//                res.view({ cogroup: cogroup });
//            });
//    },


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

//    'edit': function (req, res) {
//        // console.log('CONTACT_EDIT', req.params.all(), req.param('id'));
//        Contact.findOne(req.param('id'))
//            .exec(function (err, contact) {
//                if (err) res.json({
//                    error: err.message
//                }, 400);
//
//                console.log('FOUND THIS:', contact);
//
//                res.view({ contact: contact });
//            });
//    },


    /**
     * Update or create a single record.
     * @param   {String}   co_name Name of company group.
     * @param   {Object}   contact Object with contact information.
     */
    updateOrCreate: function (req, res, next) {
        // console.log('BRANCH_UPDATE');
        var co_name = req.param('co_name'),
            contact = req.param('contact');

        if (contact.id !== null) {
            Contact.update({id: contact.id, group: co_name}, contact)
            .exec(function(err, recs) {
                if (err) {
                    res.send(false);
                    return false;
                }

                res.send(recs[0]);
            });
        } else {
            Contact.create(contact, function (err, rec) {
                if (err) {
                    res.send(false);
                    return false;
                }

                res.send(rec);
            });
        }
    },
    /**
     * Destroy a single record.
     * @param   {String}   co_name Name of company group.
     * @param   {String}   id Database id for record.
     */
    destroy: function (req, res, next) {
        var co_name = req.param('co_name'),
            id = req.param('id');

        Contact.destroy({id: id, group: co_name})
        .exec(function (err, recs) {
            if (err) {
                res.send(false);
                return false;
            }

            res.send(recs[0]);
        });
    },

    contactList: function (req, res, next) {
        var co_name = req.param('id');

        Contact.find({group: co_name}, function (err, contacts) {
            if (err) {
                res.send(false);
                return false;
            }
//            console.log(err, contacts);
            res.send(contacts);
        });
    }
};

