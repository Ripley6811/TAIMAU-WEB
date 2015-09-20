/**
 * OrderController
 *
 * @description :: Server-side logic for managing orders
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

    /**
     * For the new (2015-9-14) comprehensive PO page.
     * "req" parameters:
     * limit - max recs to return
     * co - Retrieve records for a specific group
     * po - Retrieve record with this value
     * mpn - Retrieve all records with product ID
     */
    index: function (req, res) {
        var search_params = {};

//        if (parseInt(req.param('id')) !== NaN) search_params.order_id = req.param('id');
        if (req.param('co')) search_params.group = req.param('co');
//        if (req.param('mpn')) search_params.MPN = req.param('mpn');
//        if (req.param('po')) search_params.orderID = req.param('po');

        if (search_params.group) {
            Cogroup.findOne(search_params.group)
            .populate('branches')
            .populate('contacts')
            .exec(function (err, group) {
                if (err) res.json(err);

                res.view({cogroup: group});
            });
        } else {
            res.view();
        }
    },

    // Sort and show all orders arranged by due date.
    due: function (req, res) {
        var page = req.param('id');
        if (page === undefined || page < 1) page = 1;

        Order.find()
        .where({is_open: true, duedate: {'!': null}})
        .paginate({page: page, limit: 16})
        .sort('duedate DESC')
        .populate('MPN')
        .populate('shipments')
        .exec(function (err, orders) {
            if (err) res.json({
                error: err.message
            }, 400);

            res.view({
                orders: orders,
                page: Number(page),
                today: new Date()
            });
        });
    },
    // Form for creating POs
    new: function (req, res) {
        var params = req.params.all();

        Cogroup.findOne(params.id)
        .populate('branches')
        .exec( function (err, cogroup) {
                res.view({
                    cogroup: cogroup,
            });
        });
    },
    // Form for creating default POs along with new shipment
    create: function (req, res) {
        var params = req.params.all();
        console.log('CREATE PO\n', params, '\n');

        // Create PO's for each item
        var newOrders = [],
            productUpdates = [],
            prodMPNs = [],
            taxIt = [];

        for (var i=0; i<params.applytax.length; i++) {
            if (params.applytax[i] == 'apply?') {
                if (params.applytax[i+1] == 'yes') {
                    taxIt.push(true);
                } else {
                    taxIt.push(false);
                }
            }
            console.log(taxIt);
        }
        if (!(params.MPN instanceof Array)) {
            params.MPN = [params.MPN];
            params.price = [params.price];
            params.qty = [params.qty];
            params.ordernote = [params.ordernote];
            params.is_supply = [params.is_supply];
        }
        for (var i=0; i<params.MPN.length; i=i+1) {
            newOrders.push({
                group: params.group,
                seller: params.is_supply[i] === 'true' ? params.group : '台茂',
                buyer: params.is_supply[i] === 'false' ? params.group : '台茂',
                orderID: params.orderID,
                MPN: params.MPN[i],
                price: params.price[i],
                applytax: taxIt[i],
                qty: params.qty[i],
                orderdate: params.orderdate,
                ordernote: params.ordernote[i],
                is_purchase: params.is_supply[i] === 'true',
                is_sale: params.is_supply[i] === 'false',
                is_open: 'make_shipment' in params ? false : true,
            });
            // Update current price for each product
            Product.update(
                {MPN: params.MPN[i]},
                {curr_price: params.price[i]},
                function (err, products) {}
            );
        }

        console.log('CREATE PO\n', newOrders, '\n');
        Order.create(newOrders, function (err, orders) {
            if (err) {
                res.json({
                    where: 'Order.create(newOrders)',
                    error: err
                }, 400);
                return;
            }

            console.log('ORDERS RETURNED:\n', orders);
            // Create Shipment for item group
            if ('make_shipment' in params) {
                var newShipment = {
                    shipmentdate: params['shipmentdate'],
                    shipment_no: params['shipment_no'],
                    shipmentnote: params['shipmentnote'],
                    shipmentdest: params['shipmentdest'],
                };

                Shipment.create(newShipment, function (err, shipment) {
                    if (err) res.json({
                        where: 'Shipment.create(newShipment)',
                        error: err.message
                    }, 400);

                    orders.forEach( function (order) {
                        var newItem = {
                            order_id: order.id,
                            shipment_id: shipment.id,
                            qty: order.qty
                        }
                        Shipmentitem.create(newItem, function (err, shipmentitem) {
                            if (err) res.json({
                                where: 'Shipmentitem.create(newItem)',
                                error: err.message
                            }, 400);
                        });
                    });
                });
            }
            // Go to create shipment page.
            res.redirect('/shipment/new/' + params.group);
        });
    },
    // Get all shipments for an order and order by duedate or id.
    show: function (req, res) {
//        console.log('SHOW\n', req.params.all());

        Shipmentitem.find()
        .where({order_id: req.param('id')})
        .populate('shipment_id')
        .sort({ duedate: 0, id: 0 })
        .exec(function (err, shipmentitems) {
            if (err) res.json({
                error: err.message
            }, 400);

            Order.findOne(req.param('id'))
            .populate('group')
//            .populate('branches')  // NOT POSSIBLE
            .populate('MPN')
            .populate('shipments')
            .exec(function (err, order) {
                if (err) res.json({
                    error: err.message
                }, 400);

                res.view({
                    order: order,
                    cogroup: order.group,
                    shipments: shipmentitems,
                    id: order.id
                });
            });
        });
    },

//    showall: function (req, res) {
//        console.log('SHOWALL\n', req.params.all());
//        var groupName = req.param('id'),
//            page = parseInt(req.param('page')),
//            pageLimit = 16; // Records per page.
//
//        // Calculate number of pages.
//        Order.count({group: groupName}, function(e, count){
//            var maxPage = Math.ceil(count / pageLimit);
//            if (page === undefined || isNaN(page) || page < 1) page = 1;
//            if (page > maxPage) page = maxPage;
//
//            Order.find({group: groupName})
//            .sort('orderdate DESC')
//            .populate('MPN')
//            .populate('group')
//            .populate('shipments')
//            .paginate({page: page, limit: 16})
//            .exec(function (err, orders) {
//                if (err) res.json({
//                    error: err.message
//                }, 400);
//
//                Cogroup.findOne(req.param('id'), function (err, cogroup) {
//                    res.view({
//                        cogroup: cogroup,
//                        orders: orders,
//                        page: page,
//                        maxPage: maxPage,
//                    });
//                });
//            });
//        });
//    },

    // Update Order details from order page
    update: function (req, res) {
        var id = req.param('id'),
            updates = req.param('updates');

        console.log(req.params.all());
        Invoiceitem.count({order_id: id})
        .exec(function (err, nrecs) {
            // Do not update price and tax if invoices exist
            if (nrecs > 0) {
                delete updates['applytax']
                delete updates['price']
            }
            // Update record
            Order.findOne(id)
            .populate('MPN')
            .exec( function (err, order) {
                if (err) { res.send(err); return; }

                for (var prop in updates) {
                    order[prop] = updates[prop];
                }
                order.save();
                res.json(order);
            });
        });
    },

    // Retrieve all open orders for a company.
    getOpen: function (req, res, next) {
        var co_name = req.param('id');
        Order.find({group: co_name, is_open: true})
        .populate('MPN')
        .populate('shipments')
        .exec(function (err, orders) {
            res.send(orders);
        });
    },
    // Retrieve all orders for a company.
    getAll: function (req, res, next) {
        var co_name = req.param('id');
        Order.find({group: co_name})
        .exec(function (err, orders) {
            res.send(orders);
        });
    },

    // Retrieve a limited "page" of orders.
    page: function (req, res, next) {
        var limit = req.param('limit') || 50,
            page = req.param('page') || 1,
            search_params = {};

//        if (parseInt(req.param('id')) !== NaN) search_params.order_id = req.param('id');
        if (req.param('co')) search_params.group = req.param('co');
        if (req.param('mpn')) search_params.MPN = req.param('mpn');
        if (req.param('po')) search_params.orderID = req.param('po');

        Order.find(search_params)
        .paginate({page: page, limit: limit})
        .populate('MPN')
        .populate('shipments')
        .sort('orderdate DESC')
        .exec(function (err, orders) {
            if (err) res.json(err);

            for (var i=0; i<orders.length; i++) {
                orders[i].qty_shipped = orders[i].qty_shipped();
                delete orders[i].shipments;
            }

            res.json({orders: orders})
        });
    },


    status: function (req, res) {
        var params = req.params.all();

        Cogroup.findOne({name: params.id})
        .populate('branches')
        .exec( function (err, cogroup) {
            if (err) {
                res.json({
                    error: err
                }, 400);
                return;
            }

            res.view({
                cogroup: cogroup,
            });
        });
    },

    /**
     * Deletes a single order record.
     * Used by '/order' page.
     * Created: 2015 Sept. 17.
     */
    delete: function (req, res) {
        var rec_id = req.param('id');

        Order.findOne(rec_id)
        .exec(function (err, rec) {
            if (err) {res.json(err); return;}

            rec.destroy(function (err) {
                if (err) {
                    res.json(err);
                } else {
                    res.send(204);
                }
            });
        })
    },

    /**
     * Creates a single new PO
     * Used in "order?co=CO" page.
     */
    createOne: function (req, res) {
        var data = req.param('data');

        Order.create(data)
        .exec(function (err, rec) {
            if (err) {res.send(err); return;}

            // Return rec with MPN populated
            Order.findOne(rec.id)
            .populate('MPN')
            .exec(function (err, recPlusMPN) {
                if (err) {res.send(err); return;}

                res.json(recPlusMPN);
            });
        });
    }
};

