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
                orders.sort(function (a, b) {
                    return a.MPN.json.rank - b.MPN.json.rank;
                });
                
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
        console.log('shipments/create/', req.params.all());
        var params = req.params.all();
        
        if (!(params.PO instanceof Array)) {
            params.PO = [params.PO];
            params.qty = [params.qty];
        }
        
        var orderIDs = params.PO,
            qty = params.qty,
            back = params.back;
        
        var newShipment = {
            shipmentdate: params['shipmentdate'],
            shipment_no: params['shipment_no'],
            shipmentnote: params['shipmentnote'],
            shipmentdest: params['shipmentdest']
        };
        
        Shipment.create(newShipment)
        .exec( function (err, shipment) {
            if (err) res.json({
                error: err.message
            }, 400);
            
            console.log('SHIPMENT:', shipment);
            
            Order.find(orderIDs)
            .populate('MPN')
            .exec( function (err, orders) {
                if (err) res.json({
                    error: err.message
                }, 400); 
                
                orders.forEach( function (order) {
                    console.log("ORDERS:", orderIDs.indexOf(order.id.toString()), qty[orderIDs.indexOf(order.id.toString())]);
                    var newItem = {
                        order_id: order.id,
                        shipment_id: shipment.id,
                        qty: qty[orderIDs.indexOf(order.id.toString())]
                    }
                    Shipmentitem.create(newItem)
                    .exec( function (err, shipmentitem) {
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

