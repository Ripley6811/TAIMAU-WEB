/**
 * CogroupController
 *
 * @description :: Server-side logic for managing cogroups
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    

    'index': function (req, res) {
        var findParams = { sort: 'name' };
        var id = req.param('id');
        if (id == 'suppliers') {
            findParams.where = { is_supplier: true };
        }
        if (id == 'customers') {
            findParams.where = { is_customer: true };
        }
        Cogroup.find(findParams)
        .populate('branches')
        .populate('orders')
        .exec(function (err, cogroups) {
            if (err) res.json({
                error: err.message
            }, 400);
            
            // Sort by the number of attached order records.
            cogroups.sort(function(a, b) {return b.orders.length - a.orders.length})

            res.view({ cogroups: cogroups });
        });
    },
	
    'new': function (req, res) {
        res.view();
    },
	
    show: function (req, res) {
        Cogroup.findOne(req.param('id'))
        .populate('branches')
        .populate('contacts')
        .populate('products', {sort: { is_supply: 0, inventory_name: 1 }})
        .exec(function (err, cogroup) {
            if (err) res.json({
                error: err.message
            }, 400);

            res.view({ 
                cogroup: cogroup,
                contacts: cogroup.contacts,
                products: cogroup.products
            });
        });
    },
    
    create: function (req, res) {
        var cogroupObj = {
            name: req.param('name')
        };

        // Create a User with the params sent from 
        // the sign-up form --> new.ejs
        Cogroup.create(cogroupObj, function(err, cogroup) {

            // If there's an error
            if (err) {
                console.log(err);
                // If error redirect back to creation page
                return res.redirect('/cogroup/new/');
            }

            res.redirect('/cogroup/show/' + cogroupObj.name);
        });
        
    },
    
    toggle: function(req, res) {
        var name = req.param('cogroup'),
            toggle = req.param('toggle');
        
        Cogroup.findOneByName(name, function (err, group) {
            if (err) res.json({
                error: err.message
            }, 400);

            if (toggle === 'supplier') {
                group.is_supplier = !group.is_supplier;
            }
            if (toggle === 'customer') {
                group.is_customer = !group.is_customer;
            }
            // Save changes
            group.save(function cogroupUpdated(err, cogroup) {
                if (err) return err;

                res.redirect(req.param('back'));
            });
        });
    },

    destroy: function (req, res, next) {
        var name = req.param('id');
        Cogroup.findOne(name)
            .populate('branches')
            .exec(function (err, cogroup) {

                if (err) res.json({
                    error: err.message
                }, 400);

                if (!cogroup) return next('Cogroup doesn\'t exist.');

                // If no orders exist then it can be deleted.
                if (cogroup.branches.length === 0) {
                    var delRecord = {
                        name: cogroup.name
                    };
                    
                    Cogroup.destroy(delRecord).exec(function (err, cogroups) {
                        if (err) res.json({
                            error: err.message
                        }, 400);

                        res.redirect('/cogroup/');
                    });
                }
            });
    }
};

