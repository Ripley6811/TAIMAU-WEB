/**
 * OrderController
 *
 * @description :: Server-side logic for managing orders
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

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
            // Return to PO view
            res.redirect('/order/showall/' + params.group);
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

    showall: function (req, res) {
        console.log('SHOWALL\n', req.params.all());
        var groupName = req.param('id'),
            page = parseInt(req.param('page')),
            pageLimit = 16; // Records per page.

        // Calculate number of pages.
        Order.count({group: groupName}, function(e, count){
            var maxPage = Math.ceil(count / pageLimit);
            if (page === undefined || isNaN(page) || page < 1) page = 1;
            if (page > maxPage) page = maxPage;

            Order.find({group: groupName})
            .sort('orderdate DESC')
            .populate('MPN')
            .populate('group')
            .populate('shipments')
            .paginate({page: page, limit: 16})
            .exec(function (err, orders) {
                if (err) res.json({
                    error: err.message
                }, 400);

                Cogroup.findOne(req.param('id'), function (err, cogroup) {
                    res.view({
                        cogroup: cogroup,
                        orders: orders,
                        page: page,
                        maxPage: maxPage,
                    });
                });
            });
        });
    },
    // Update Order details from Order/Showall page
    update: function (req, res) {
//        var order = req.param('order');
//        console.log(req.params.all());
        Invoiceitem.count({order_id: req.param('id')})
        .exec(function (err, nrecs) {
            var allowPriceChange = nrecs === 0 ? true : false;

            if (allowPriceChange) {
                Order.update({id: req.param('id')}, req.params.all())
                .exec( function (err, orders) {
                    if (err) { res.send(err); return; }

                    req.flash('message', 'Record Updated!');
                    res.redirect('/order/show/'+orders[0].id);
                });
            } else {
                Order.findOne({id: req.param('id')})
                .exec( function (err, order) {
                    if (err) { res.send(err); return; }
                    var params = req.params.all();
                    if (order.price != params.price) {
                        req.flash('message', 'Cannot change price with existing invoices!');
                    }
                    // Update QTY and NOTE only
                    order.qty = params.qty;
                    order.ordernote = params.ordernote;
                    order.orderID = params.orderID;
                    order.save();
                    req.flash('message', 'Record Updated!');
                    res.redirect('/order/show/'+order.id);
                });
            }

//

        });

    },
    // Retrieve all order for a company.
    getOpen: function (req, res, next) {
        var co_name = req.param('id');
        Order.find({group: co_name, is_open: true})
        .populate('MPN')
        .populate('shipments')
        .exec(function (err, orders) {
            res.send(orders);
        });
    },
    // Retrieve all order for a company.
    getAll: function (req, res, next) {
        var co_name = req.param('id');
        Order.find({group: co_name})
        .exec(function (err, orders) {
            res.send(orders);
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
    }
};

