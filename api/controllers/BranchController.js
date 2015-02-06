/**
 * BranchController
 *
 * @description :: Server-side logic for managing branches
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

    'new': function (req, res) {
        Cogroup.findOne(req.param('id'))
//            .populate('branches')
            .exec(function (err, cogroup) {
                if (err) res.json({
                    error: err.message
                }, 400);

                res.view({ cogroup: cogroup });
            });
    },
    
    
    create: function (req, res, next) {
//        console.log(req.params.all());

        var branchObj = {
            name: req.param('name'),
            group: req.param('group'),
            fullname: req.param('fullname'),
            english_name: req.param('english_name'),
            tax_id: req.param('tax_id'),
            phone: req.param('phone'),
            fax: req.param('fax'),
            email: req.param('email'),
            address_office: req.param('address_office'),
            address_shipping: req.param('address_shipping'),
            address_billing: req.param('address_billing'),
            note: req.param('note')
        };

        // Create a User with the params sent from 
        // the sign-up form --> new.ejs
        Branch.create(branchObj, function(err, branch) {

            // If there's an error
            if (err) {
                console.log(err);
                // If error redirect back to creation page
                return res.redirect('/branch/new/' + branchObj.group);
            }

            res.redirect('/cogroup/show/' + branchObj.group);
        });
    },
    
    'index': function (req, res) {
        Branch.find({
            where: {
                group: {
                    '!': '台茂'
                }
            },
            sort: 'group'
        })
            .exec(function (err, branches) {
                if (err) res.json({
                    error: err.message
                }, 400);

                res.view({
                    branches: branches
                });
            });
    },

    'edit': function (req, res) {
//        console.log('BRANCH_EDIT', req.params.all(), req.param('id'));
        Branch.findOne(req.param('id'))
            .exec(function (err, branch) {
                if (err) res.json({
                    error: err.message
                }, 400);
            
                // Add a parameter giving the number of orders in the database.
                var qstring = 'SELECT (SELECT COUNT(*) FROM `order` WHERE `group` = ?) AS NumberOfRecords, (SELECT COUNT(*) FROM `contact` WHERE `branch` = ?) AS NumberOfContacts;';
                Branch.query(qstring, [branch.group, branch.name], function (err, rows) {
                    if (err) res.json({
                        error: err.message
                    }, 400);

                    res.view({
                        branch: branch,
                        numberOfRecords: rows[0].NumberOfRecords,
                        numberOfContacts: rows[0].NumberOfContacts,
                        group: branch.group
                    });
                });
            });
    },

    update: function (req, res, next) {
        //        console.log('BRANCH_UPDATE');
        var name = req.param('name'),
            updates = {
                fullname: req.param('fullname'),
                english_name: req.param('english_name'),
                tax_id: req.param('tax_id'),
                phone: req.param('phone'),
                fax: req.param('fax'),
                email: req.param('email'),
                address_office: req.param('address_office'),
                address_shipping: req.param('address_shipping'),
                address_billing: req.param('address_billing'),
                note: req.param('note')
            };

        if (name) {
            Branch.update(name, updates)
                .exec(function branchUpdated(err, branch) {
                    if (err) return err;

                    req.flash('message', 'Record Updated!');
                    res.redirect('/branch/edit/' + name);
                });
        }
    },
    
    branchList: function (req, res, next) {
        var co_name = req.param('id');
        
        Branch.find({group: co_name}, function (err, branches) {
//            console.log(err, branches);
            res.send(branches);
        });
    },
    
    /**
     * Update or create a single record.
     * @param   {String}   co_name Name of company group.
     * @param   {Object}   branch Object with branch information.
     */
    updateOrCreate: function (req, res, next) {
        // console.log('BRANCH_UPDATE');
        var co_name = req.param('co_name'),
            branch = req.param('branch');
        
        // Blank name IDs are not allowed.
        if (branch.name === '') {
            res.send(false);
            return false;
        }

        Branch.findOrCreate({name: branch.name, group: co_name}, branch)
        .exec(function(err, rec) {
            if (err) {
                res.send(false);
                return false;
            }
            
//            console.log('BRANCH FINDorCREATE:', typeof rec, rec);
            
            Branch.update({name: branch.name, group: co_name}, branch)
            .exec(function (err, recs) {
                if (err) {
                    res.send(false);
                    return false;
                }

//                console.log('BRANCH UPDATE:', typeof recs, recs);
                res.send(recs[0]);
            });
        });
    },
    
    /**
     * Destroy a single record.
     * @param   {String}   co_name Name of company group.
     * @param   {String}   name Database id for record.
     */
    destroy: function (req, res, next) {
        var co_name = req.param('co_name'),
            name = req.param('name');
        
        Branch.destroy({name: name, group: co_name})
        .exec(function (err, recs) {
            if (err) {
                res.send(false);
                return false;
            }
            console.log('BRANCH DESTROY:', typeof recs, recs);
            res.send(recs[0]);
        });
    },

};