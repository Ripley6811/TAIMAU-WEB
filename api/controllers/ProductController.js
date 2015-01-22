/**
 * ProductController
 *
 * @description :: Server-side logic for managing products
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    // Sort and show all products by inventory_name.
    'index': function (req, res) {
        var id = req.param('id'),
            findParams = { sort: 'name' };
        if (id == 'suppliers') {
            findParams.where = { is_supplier: true };
        }
        if (id == 'customers') {
            findParams.where = { is_customer: true };
        }
        Cogroup.find(findParams)
        .populate('products')
        .exec(function (err, cogroups) {
            if (err) res.json({
                error: err.message
            }, 400);

            res.view({ cogroups: cogroups });
        });
    },
    // Show products for a specific company.
    show: function (req, res) {
        var id = req.param('id');
        
        Cogroup.findOne(id)
            // Sort numbers are ascending (1) and descending (0).
            .populate('products', {sort: { is_supply: 0, inventory_name: 1 }})
            .exec(function (err, cogroup) {
                if (err) res.json({
                    error: err.message
                }, 400);

                res.view({ cogroup: cogroup });
            });
    },
    // Edit product information.
    edit: function (req, res) {
        var id = req.param('id');
        
        Product.findOne(id)
            .populate('group')
            .populate('orders')
            .exec(function (err, product) {
                if (err) res.json({
                    error: err.message
                }, 400);

                res.view({ product: product });
            });
    },
    // Edit product information.
    update: function (req, res) {
        var id = req.param('MPN'),
            updates = {
                inventory_name: req.param('inventory_name'),
                product_label: req.param('product_label'),
                english_name: req.param('english_name'),
                SKUlong: req.param('SKUlong'),
                SKU: req.param('SKU'),
                note: req.param('note'),
                json: req.param('json')
            };

        if (id && updates.inventory_name != '') {
            Product.update(id, updates)
                .exec(function(err, product) {
                    if (err) return err;

                    req.flash('message', 'Record Updated!');
                    res.redirect('/product/edit/' + id);
                });
        }
    },
    // Edit product information.
    toggle_discontinued: function (req, res) {
        var id = req.param('id')
        Product.findOne(id)
            .exec(function (err, product) {
                if (err) res.json({
                    error: err.message
                }, 400);
            
                var updateParams = {};
                updateParams.discontinued = !product.discontinued;

                Product.update(id, updateParams)
                    .exec(function cogroupUpdated(err, product) {
                        if (err) return err;

                        res.redirect('/product/edit/' + id);
                    });
            });
    }
	
};

