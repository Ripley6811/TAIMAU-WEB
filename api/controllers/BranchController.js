/**
 * BranchController
 *
 * @description :: Server-side logic for managing branches
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

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
        console.log('FOUND THIS:', branch);
                // Add a parameter giving the number of orders in the database.
                var qstring = 'SELECT (SELECT COUNT(*) FROM `order` WHERE `group` = ?) AS NumberOfRecords, (SELECT COUNT(*) FROM `contact` WHERE `branch` = ?) AS NumberOfContacts;';
                Branch.query(qstring, [branch.group, branch.name], function (err, rows) {
                    if (err) res.json({
                        error: err.message
                    }, 400);

                    console.log('COUNT RESULTS:', rows[0]);
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

    destroy: function (req, res, next) {
        var qstring = 'SELECT COUNT(*) AS NumberOfRecords FROM `order` WHERE `group` = ?;';
        var name = req.param('id');
        Branch.findOne(name)
            .exec(function (err, branch) {

                if (err) res.json({
                    error: err.message
                }, 400);

                if (!branch) return next('Branch doesn\'t exist.');

//                console.log(qstring);
                Branch.query(qstring, [branch.group], function (err, rows) {
                    if (err) res.json({
                        error: err.message
                    }, 400);
                    console.log('COUNT for', branch.name, branch.group, rows[0]);

                    // If no orders exist then it can be deleted.
                    if (rows[0].NumberOfRecords === 0) {
                        var delRecord = {
                            name: branch.name
                        };
//                        console.log('DELETING', delRecord, rows[0]);
                        Branch.destroy(delRecord).exec(function (err, branches) {
                            if (err) res.json({
                                error: err.message
                            }, 400);

//                            console.log('DESTROYED:', err, branches);
                            res.redirect('/branch');
                        });
                    }
                });
            });
    }

};