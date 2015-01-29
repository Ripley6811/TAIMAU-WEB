/**
 * ShipmentController
 *
 * @description :: Server-side logic for managing shipments
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	new: function (req, res) {
        console.log(req.params.all());
        Order.find({id: req.param('orderIDs')})
        .populate('MPN')
        .populate('group')
        .exec( function (err, orders) {
            if (err) res.json({
                error: err.message
            }, 400);
            
            if (orders.length === 0) {
                res.redirect(req.param('back'));
            } else {
                Cogroup.findOne(orders[0].group.name)
                .populate('branches')
                .populate('contacts')
                .exec( function (err, group) {
                    Cogroup.findOne('台茂')
                    .populate('branches')
                    .populate('contacts')
                    .exec( function (err, taimau) {
                        res.view({
                            orders: orders,
                            group: group,
                            seller: orders[0].MPN.is_supply ? group : taimau,
                            buyer: orders[0].MPN.is_supply ? taimau : group,
                            back: req.param('back')
                        });
                    });
                });
            }
        });
    },
    
	create: function (req, res) {
        var params = req.params.all(),
            orderIDs = [],
            back = req.param('back')
        
        var newShipment = {
            shipmentdate: params['shipmentdate'],
            shipment_no: params['shipment_no'],
            shipmentnote: params['shipmentnote'],
            shipmentdest: params['shipmentdest']
        };
        
        for (key in params) {
            if (key.substr(0,3) === 'PO_') {
                orderIDs.push(key.substr(3));
            }
        }
        
        Shipment.create(newShipment)
        .exec( function (err, shipment) {
            if (err) res.json({
                error: err.message
            }, 400);
            
            console.log('SHIPMENT:', shipment);
            Order.find({id: orderIDs})
            .populate('MPN')
            .exec( function (err, orders) {
                if (err) res.json({
                    error: err.message
                }, 400); 
                
                orders.forEach( function (order) {
                    console.log("ORDERS:", order, params['PO_' + order.id]);
                    Shipmentitem.create({
                        order_id: order.id,
                        shipment_id: shipment.id,
                        qty: params['PO_' + order.id]
                    }).exec( function (err, shipmentitem) {
                        if (err) res.json({
                            error: err.message
                        }, 400);
                        console.log('SHIP ITEM:', shipmentitem);
                    });
                });
                
                res.redirect(back);
            });
        });
    }
};

