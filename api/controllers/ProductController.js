/**
 * ProductController
 *
 * @description :: Server-side logic for managing products
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    // Show new product entry form.
//    'new': function (req, res) {
//        var id = req.param('id');
//
//        res.view({ group: id });
//    },
    
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

        Product.create(productObj, function (err, product) {
                if (err) {
                    console.log(err);
                    // If error redirect back to creation page
                    req.flash('message', err);
                    return res.redirect('/product/new/' + productObj.group);
                }

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

        Product.find()
            // Sort numbers are ascending (1) and descending (0).
            .where({group: id, discontinued: false})
            .sort({ is_supply: 0, inventory_name: 1 })
            .populate('group')
            .exec(function (err, products) {
                if (err) res.json({
                    error: err.message
                }, 400);
                // If no products found then send cogroup info to page.
                if (products.length === 0) {
                    Cogroup.findOne(id)
                        // Sort numbers are ascending (1) and descending (0).
                        .populate('products', {sort: { is_supply: 0, inventory_name: 1 }})
                        .exec(function (err, cogroup) {
                            if (err) res.json({
                                error: err.message
                            }, 400);

                            res.view({
                                cogroup: cogroup,
                                products: [],
                                orders: []
                            });
                        });
                } else {
                    // Find all open POs for active products and show on page.
                    var MPNs = [];
                    for (var i=0; i<products.length; i=i+1) {
                        if (products[i].json === null) {
                            products[i].json = {rank: i};
                            products[i].save(function (err, prod) {
                                console.log('Save Prod Rank:', prod.inventory_name, prod.json.rank);
                            });
                        } else if (products[i].json.rank === undefined) {
                            products[i].json.rank = i;
                            products[i].save(function (err, prod) {
                                console.log('Save Prod Rank:', prod.inventory_name, prod.json.rank);
                            });
                        }
                    }
                    // Sort by product rank
                    products.sort(function (a, b) {return a.json.rank - b.json.rank});

                    for (var i=0; i<products.length; i=i+1) {
                        MPNs.push(products[i].MPN);
                    }

                    Order.find({MPN: MPNs, is_open: true})
                    .populate('shipments')
                    .populate('MPN')
                    .exec(function (err, orders) {
                        if (err) res.json({
                            error: err.message
                        }, 400);

                        orders.sort(function (a, b) {
                            return a.MPN.json.rank - b.MPN.json.rank;
                        });

                        res.view({
                            products: products,
                            cogroup: products[0].group,
                            orders: orders
                        });
                    });
                }
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

    /**
     * Update or create a single record.
     * @param   {String}   co_name Name of company group.
     * @param   {Object}   product Object with product information.
     */
    updateOrCreate: function (req, res, next) {
        var co_name = req.param('co_name'),
            product = req.param('product');

        // Blank name IDs are not allowed.
        if (product.MPN === null || product.MPN === '') {
            product.MPN = String(Math.round(Math.random()*100000000)+100)
        }

        Product.findOrCreate({MPN: product.MPN, group: co_name}, product)
        .exec(function(err, rec) {
            if (err) {
                console.log('PRODUCT FINDorCREATE:');
                console.log(JSON.stringify(err, null, '   '));
                res.send(err);
                return false;
            }
            // Update when either found or created.
            Product.update({MPN: product.MPN, group: co_name}, product)
            .exec(function (err, recs) {
                if (err) {
                    console.log('PRODUCT UPDATE:');
                    console.log(JSON.stringify(err, null, '   '));
                    res.send(err);
                    return false;
                }
                console.log(recs);
                res.send(recs[0]);
            });
        });
    },

    /**
     * Destroy a single record.
     *
     * Returns status 500 error if product cannot be deleted due to linked
     * records.
     * @param   {String}   co_name Name of company group.
     * @param   {String}   MPN Database id for record.
     */
    destroy: function (req, res, next) {
        var co_name = req.param('co_name'),
            MPN = req.param('MPN');

        Product.destroy({MPN: MPN, group: co_name})
        .exec(function (err, recs) {
            if (err) {
                console.log('PRODUCT DESTROY:');
                console.log(JSON.stringify(err, null, '   '));
                res.send(err);
                return false;
            }
            console.log('PRODUCT DESTROY:', typeof recs, recs);
            res.send(recs[0]);
        });
    },

    // Retrieve all products for a company.
    get: function (req, res) {
        var co_name = req.param('id'),
            counter = 0;
        Product.find({group: co_name}, function (err, products) {
            // Check and update rank values.
            products.forEach(function (rec) {
                if (rec.json === undefined || rec.json === null) rec.json = {};
                if (rec.json.rank === undefined) {
                    rec.json.rank = products.indexOf(rec);
                }
                rec.save(function () {});
            });
            res.send(products);
        });
    },

    merge: function (req, res, next) {
        var co_name = req.param('id'),
            products = req.param('products');

        for (var i=0; i<products.length; i++) {
            if (isNaN(products[i].curr_price) || products[i].curr_price === '') {
                products[i].curr_price = 0.0;
            }
            Product.update({MPN: products[i].MPN, group: co_name}, products[i])
            .exec(function (err, records) {
                console.log('PRODUCT UPDATE:', err, records);
            });
        }
    },

    showall: function (req, res) {
        // Return cogroup info for side panel
        Cogroup.findOne(req.param('id'))
        .populate('branches')
        .exec(function (err, cogroup) {
            if (err) res.json({
                error: err.message
            }, 400);

            res.view({
                cogroup: cogroup,
            });
        });
    },

    options: function (req, res) {
        Product.find()
        .exec(function (err, recs) {
            if (err) res.json({
                error: err.message
            }, 400);

            var ret_list = [];
            for (var i=0; i<recs.length; i++) {
                ret_list.push({
                    id: recs[i].id,
                    isRaw: recs[i].is_supply,
                    optionsText: recs[i].optionsText()
                });
            }
            res.json(ret_list);
        });
    },


    /**
    * `Database/ProductController.getId()`
    */
    getId: function (req, res) {
        Product
        .findOne({id: req.param('id')})
        .exec(function (err, record) {
            if (err) { res.send(err); return; }
            res.json(record);
        });
    },


    /**
    * `Database/ProductController.price()`
    */
    price: function (req, res) {
        Order
        .find({MPN: req.param('id')})
        .sort('orderdate DESC')
        .limit(1)
        .exec(function (err, records) {
            if (err) { res.send(err); return; }
            res.json(records[0] ? records[0].price : null);
        });
    },
};

