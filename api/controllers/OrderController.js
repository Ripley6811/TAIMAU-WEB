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
    // Form for creating default POs along with new shipment
    new: function (req, res) {
        var params = req.params.all();
        console.log('order/new', params);
        if (!('make_po' in params || 'make_shipment' in params)) {
            res.redirect(req.param('back'));
            return;
        }
        if (!('product' in params)) {
            res.redirect(req.param('back'));
            return;
        }
        
        Product.find({MPN: req.param('product')})
        .populate('group')
        .exec(function (err, products) {
            if (err) res.json({
                error: err.message
            }, 400);
            // Sort products by rank
            products.sort(function (a, b) {
                return a.json.rank - b.json.rank;
            });
            
            if (products.length === 0) {
                res.redirect(req.param('back'));
            } else {
                Cogroup.findOne(products[0].group.name)
                .populate('branches')
                .populate('contacts')
                .exec( function (err, group) {
                    Cogroup.findOne('台茂')
                    .populate('branches')
                    .populate('contacts')
                    .exec( function (err, taimau) {
                        res.view({
                            form_type: 'make_po' in params ? 'make_po' : 'make_shipment',
                            products: products,
                            cogroup: group,
                            group: group,
                            seller: products[0].is_supply ? group : taimau,
                            buyer: products[0].is_supply ? taimau : group,
                            back: params.back
                        });
                    });
                });
            }
            
        });
        
    },
    // Form for creating default POs along with new shipment
    create: function (req, res) {
        var params = req.params.all();
        console.log('CREATE PO\n', params, '\n');
        
        // Create PO's for each item
        var newOrders = [],
            productUpdates = [],
            prodMPNs = [];
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
                seller: params.seller,
                buyer: params.buyer,
                orderID: params.orderID,
                MPN: params.MPN[i],
                price: params.price[i],
                qty: params.qty[i],
                orderdate: params.orderdate,
                ordernote: params.ordernote[i],
                is_purchase: params.is_supply[i],
                is_sale: !params.is_supply[i],
                is_open: 'make_shipment' in params ? false : true,
            });
            // Update current price for each product
            Product.update(
                {MPN: params.MPN[i]}, 
                {curr_price: params.price[i]}, 
                function (err, products) {}
            );
        }
        
        Order.create(newOrders, function (err, orders) {
            if (err) res.json({
                where: 'Order.create(newOrders)',
                error: err.message
            }, 400);
        
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
            res.redirect(params.back);
        });
    },
    // Get all shipments for an order and order by duedate or id.
    show: function (req, res) {
        console.log('SHOW\n', req.params.all());
        
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
    // Toggle open/close on orders
    toggle_open: function (req, res) {
        console.log('TOGGLE OPEN\n', req.params.all());
        
        Order.find(req.param('orderIDs'), function (err, orders) {
            if (err) res.json({
                where: 'Order.find',
                error: err.message
            }, 400);
            
            orders.forEach( function (order) {
                order.is_open = !order.is_open;
                order.save( function (err, newOrder) {
                    if (err) res.json({
                        where: 'order.save',
                        error: err.message
                    }, 400);
                });
            }); 
            
            res.redirect(req.param('back'));
        });
    },
    // Get all shipments for an order and order by duedate or id.
    update: function (req, res) {
        console.log(req.params.all());
        Order.update({id: req.param('id')}, req.params.all())
        .exec( function (err, order) {
            if (err) res.json({
                error: err.message
            }, 400);
            
            req.flash('message', 'Record Updated!');
            res.redirect('/order/show/' + order[0].id);
        });
    }
};

