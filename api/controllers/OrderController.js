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
    new: function (req, res) {
        console.log(req.params.all());
        
        Product.find({MPN: req.param('product')})
        .exec(function (err, products) {
            if (err) res.json({
                error: err.message
            }, 400);
            
            if ('make_po' in req.params.all()) {
                console.log('MAKE PO');
            } else if ('make_shipment' in req.params.all()) {
                console.log('MAKE SHIPMENT');
            }
        });
        
    },
    // Get all shipments for an order and order by duedate or id.
    show: function (req, res) {
        console.log(req.params.all());
        
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
    }
};

