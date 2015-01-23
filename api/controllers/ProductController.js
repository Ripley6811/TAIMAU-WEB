/**
 * ProductController
 *
 * @description :: Server-side logic for managing products
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    // Show new product entry form.
    'new': function (req, res) {
        var id = req.param('id');
        
        res.view({ group: id });
    },
    // Show new product entry form.
    create: function (req, res) {
        var productObj = {
                MPN: String(Math.round(Math.random()*100000000)),
                group: req.param('group'),
                inventory_name: req.param('inventory_name'),
                product_label: req.param('product_label'),
                english_name: req.param('english_name'),
                SKUlong: req.param('SKUlong'),
                SKU: req.param('SKU'),
                units: req.param('units'),
                UM: req.param('UM'),
                is_supply: Boolean(Number(req.param('is_supply'))),
                unitpriced: Boolean(Number(req.param('unitpriced'))),
                note: req.param('note'),
                json: req.param('json')
            };
        console.log('NEw ProduCt:', productObj);
        Product.create(productObj, function (err, product) {
                if (err) {
                    console.log(err);
                    // If error redirect back to creation page
                    return res.redirect('/product/new/' + productObj.group);   
                }
                console.log('RETURNED PRODUCT:', product);
                res.redirect('/product/edit/' + productObj.MPN);
            });
    },
    // Sort and show all products by inventory_name.
    'index': function (req, res) {
        Product.find()
        .populate('group')
        .sort('inventory_name')
        .exec(function (err, products) {
            if (err) res.json({
                error: err.message
            }, 400);

            res.view({ products: products });
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
    // Show product editing form.
    edit: function (req, res) {
        var id = req.param('id').replace('-percent-','%');
        
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
    // Submit product updates to database.
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
                    res.redirect('/product/edit/' + id.replace('%','-percent-'));
                });
        }
    },
    // Toggle the 'discontinued' boolean and redirect back to edit page.
    toggle_discontinued: function (req, res) {
        var id = req.param('id').replace('-percent-','%');
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

                        res.redirect('/product/edit/' + id.replace('%','-percent-'));
                    });
            });
    },
    // Delete the product and redirect to company product list.
    destroy: function (req, res) {
        var id = req.param('id').replace('-percent-','%');
        
        Product.findOne(id)
        .populate('group')
        .populate('orders')
        .exec(function (err, product) {
            if (err) res.json({
                error: err.message
            }, 400);
            
            var group = product.group !== undefined ? product.group.name : undefined;
            if (product.orders.length === 0) {
                Product.destroy(id)
                .exec(function(err, product) {
                    if (err) return err;
                    
                    if (group !== undefined) {
                        res.redirect('/product/show/' + group);
                    } else {
                        res.redirect('/product/');
                    }
                });
            }
        });
    }
	
};

