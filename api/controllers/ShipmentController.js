/**
 * ShipmentController
 *
 * @description :: Server-side logic for managing shipments
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	new: function (req, res) {
        var params = req.params.all();

        Cogroup.findOne({name: params.id})
        .populate('branches')
        .populate('contacts')
        .exec( function (err, cogroup) {
                res.view({
                    cogroup: cogroup,
            });
        });
    },

	create: function (req, res) {
        console.log('shipments/create/', req.params.all());
        var params = req.params.all();
        // Convert data to arrays if not already (if single entry).
        if (!(params.PO instanceof Array)) {
            params.PO = [params.PO];
            params.MPN = [params.MPN];
            params.qty = [params.qty];
            params.price = [params.price];
            params.is_supply = [params.is_supply];
        }

        var orderIDs = params.PO,
            qty = params.qty;

        // Collect data for shipment
        var newShipment = {
            shipmentdate: params['shipmentdate'],
            shipment_no: params['shipment_no'],
            shipmentnote: params['shipmentnote'],
            shipmentdest: params['shipmentdest'],
            group: params.group,
        };

        // Create default Order data for non-PO shipments
        defaultOrders = [];
        for (var i=0; i<orderIDs.length; i++) {
            var record = {
                id: orderIDs[i] === 'default' ? undefined : orderIDs[i],
                group: params.group,
                seller: params.is_supply[i] === 'true' ? params.them : params.us,
                buyer: params.is_supply[i] === 'false' ? params.them : params.us,
                qty: params.qty[i],
                MPN: params.MPN[i],
                is_sale: params.is_supply[i] === 'true' ? false : true,
                is_purchase: params.is_supply[i] === 'true' ? true : false,
                applytax: true,
                price: params.price[i],
                orderdate: params.shipmentdate,
                ordernote: '',
                orderID: '',
                is_open: false,
            }
            defaultOrders.push(record);
        }

        // Create shipment
        Shipment.create(newShipment)
        .exec( function (err, shipment) {
            if (err) { res.json(err); return; }

            console.log('SHIPMENT:', shipment);

            defaultOrders.forEach( function (defOrder) {
                console.log('DEF ORDER:', defOrder);
                Order.findOrCreate({id: defOrder.id}, defOrder, function (err, order) {
                    if (err) {
                        res.json({
                            error: err
                        }, 400);
                        return;
                    }
                    console.log('ORDER CREATE or FOUND:', order);

                    var newItem = {
                        order_id: order.id,
                        shipment_id: shipment.id,
                        qty: defOrder.qty,
                    }
                    Shipmentitem.create(newItem)
                    .exec( function (err, shipmentitem) {
                        if (err) res.json({
                            error: err.message
                        }, 400);
                        console.log('SHIP ITEM:', shipmentitem);
                    });
                });
            });
        });
        setTimeout(
            function () { res.redirect('/shipment/showall/'+params.group) },
            200
        );
    },

    showall: function (req, res) {
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

    get: function (req, res) {
        var params = req.params.all();

        Shipment.findOne({name: params.id}, function (err, cogroup) {
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

    pdf: function (req, res) {
        var sid = req.param('id');

        // Gets recent shipments for a company. "SHIPMENT/SHOWALL"
        Shipmentitem.query(
            "SELECT shipi.qty, sh.shipmentdate, sh.shipment_no, br.fullname as buyer, po.orderID, po.group, po.seller, po.ordernote as po_note, prod.inventory_name, prod.product_label, prod.UM, prod.units, prod.SKU, prod.unitcounted"
            + " FROM shipmentitem shipi "
            + " JOIN shipment sh ON sh.id = shipi.shipment_id "
            + " JOIN `order` po ON po.id = shipi.order_id "
            + " JOIN product prod ON prod.MPN = po.MPN "
            + " JOIN branch br ON po.buyer = br.name "
            + " WHERE shipment_id LIKE ?"
            + " ;"
            , [req.param('id')],
        function(err, recs) {
            if (err) {
                res.json(err);
                return;
            }

            Cogroup.findOne(recs[0].group)
            .populate('branches')
            .populate('contacts')
            .exec(function (err, group) {

                res.view({
                    cogroup: group,
                    shipment_no: recs[0].shipment_no,
                    items: recs,
    //                layout: null
                });

            })
        });

    },

    availableNumber: function (req, res) {
        var d = new Date();
        var d_cutoff = new Date(d.getFullYear(), -1, 1);
        Shipment.find({shipmentdate: { '>=': d_cutoff}})
        .exec(function (err, recs) {
            var used_nos = [];
            recs.forEach(function (each) {
                // Only interested in non-lettered shipment IDs
                used_nos.push(parseInt(each.shipment_no));
            });
//            console.log(used_nos);
            var new_number = null;
            var counter = 0;
            while (new_number === null) {
                counter += 1;
                var test_no = parseInt([
                        d.getYear()-11,
                        ('0000' + counter).slice(-4)
                    ].join(''));
                if (used_nos.indexOf(test_no) < 0) {
                    new_number = test_no.toString();
                }
            }
            res.send(new_number);
        });
    },

    checkNumber: function (req, res) {
        var no = req.param('id');
        Shipment.find(no)
        .exec(function (err, recs) {
            if (err) {
                res.json(err);
                return;
            }

            if (recs.length === 0) {
                res.send(true);
            } else {
                res.send(false);
            }
        });
    }


};

