/**
 * Database/getController
 *
 * "find" always returns a list
 *
 * @description :: Server-side logic for managing database/gets
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {



    /**
    * `Database/getController.cogroups()`
    */
    cogroups: function (req, res) {
        Cogroup
        .find()
        .exec(function (err, records) {
            if (err) { res.send(err); return; }
            res.send(records);
        });
    },


    /**
    * `Database/getController.branches()`
    */
    branches: function (req, res) {
        Branch
        .find({group: req.param('id')})
        .exec(function (err, records) {
            if (err) { res.send(err); return; }
            res.send(records);
        });
    },


    /**
    * `Database/getController.contacts()`
    */
    contacts: function (req, res) {
        Contact
        .find({group: req.param('id')})
        .exec(function (err, records) {
            if (err) { res.send(err); return; }
            res.send(records);
        });
    },


    /**
    * `Database/getController.products()`
    */
    products: function (req, res) {
        if (req.param('id') != undefined) {
            Product
            .find({group: req.param('id')})
            .sort('inventory_name')
            .exec(function (err, records) {
                if (err) { res.send(err); return; }
                res.send(records);
            });
        } else if(req.param('filter') != '' && req.param('filter') != undefined) {
            var term = req.param('filter');
            Product
            .find().where({or:[{product_label: {'contains': term}},
                               {inventory_name: {'contains': term}},
                               {english_name: {'contains': term}},
                              ]})
            .sort('inventory_name')
            .exec(function (err, records) {
                if (err) { res.send(err); return; }
                res.send(records);
            });
        } else {
            Product
            .find()
            .sort('inventory_name')
            .exec(function (err, records) {
                if (err) { res.send(err); return; }
                records.forEach(function (rec) {
                    rec.optionsText = rec.optionsText();
                });
                res.send(records);
            });
        }
    },


    /**
    * `Database/getController.product()`
    */
    product: function (req, res) {
        Product
        .findOne({MPN: req.param('id')})
        .exec(function (err, record) {
            if (err) { res.send(err); return; }
            res.send(record);
        });
    },


    /**
    * `Database/getController.orders()`
    */
    orders: function (req, res) {
        var group = req.param('group'),
            page = req.param('page') || 1,
            limit = req.param('limit') || 20;

        Order
        .find({group: group})
        .sort('orderdate DESC')
        .sort('id DESC')
        .populate('MPN')
        .populate('group')
        .populate('shipments')
        .paginate({page: page, limit: limit})
        .exec(function (err, records) {
            if (err) { res.send(err); return; }
            res.send(records);
        });
    },


    /**
    * `Database/getController.shipments()`
    */
    shipments: function (req, res) {
        var group = req.param('id'),
            page = req.param('page') || 1,
            limit = req.param('limit') || 50;

        Shipment
        .find({group: group})
        .sort('shipmentdate DESC')
        .populate('items')
        .paginate({page: page, limit: limit})
        .exec(function (err, records) {
            if (err) { res.send(err); return; }
            res.send(records);
        });




        // TEMP PROCESSING OF SHIPMENTS
        /***************************
        Shipment.find({group: null}).limit(1200).exec(function (err, records) {
            if (err) {
                console.log(JSON.stringify(err, null, '   '));
            }
            console.log(records);

            records.forEach(function (rec) {
                if (rec.group === null) {
                    Shipmentitem.findOne({shipment_id: rec.id})
                    .populate('order_id').exec(function (err, si) {
                        if (err) {
                            console.log(JSON.stringify(err, null, '   '));
                        }
//                        console.log(rec.id, rec.group, rec.shipmentdate);
                        if (si === undefined) return;
//                        console.log(si);
                        console.log(si.order_id.id, si.order_id.group);
                        rec.group = si.order_id.group;
                        rec.save();
                        si.shipped = true;
                        si.save();
                    });
                }
            });
            res.send({res:'done'});
        });
        ********************************/

        // TEMP PROCESSING OF SHIPMENT ITEMS
        /***************************
        Shipmentitem.find({shipped: false}).limit(4200).exec(function (err, records) {
            if (err) {
                console.log(JSON.stringify(err, null, '   '));
                return;
            }
            console.log(records.length, records);

            records.forEach(function (si) {
                console.log('Before:', si.shipped);
                si.shipped = true;
                si.save();
                console.log('After :', si.shipped);
            });
            res.send({res:'done'});
        });
        ********************************/
    },


    /**
    * `Database/getController.shipmentitems()`
    */
    shipmentitems: function (req, res) {
        // Request with specific order enters here. "ORDER/SHOW"
        if ('po_id' in req.params.all()) {
            Shipmentitem
            .find({order_id: req.param('po_id')})
    //        .populate('order_id')
            .populate('shipment_id')
            .exec(function (err, records) {
                if (err) { res.send(err); return; }
                res.send(records);
            });
            return;
        }
        // Gets recent shipments for a company. "SHIPMENT/SHOWALL"
        Shipmentitem.query(
            "SELECT shipi.*, sh.shipmentdate, sh.shipment_no, sh.id as shipment_id, po.price, po.orderID, invi.id as invoiceitem_id, inv.id as invoice_id, inv.invoicedate, inv.paid, inv.check_no, inv.invoice_no, prod.*, shipi.id as shipmentitem_id "
            + " FROM shipmentitem shipi "
            + " LEFT JOIN invoiceitem invi ON shipi.id = invi.shipmentitem_id "
            + " LEFT JOIN invoice inv ON invi.invoice_id = inv.id "
            + " JOIN shipment sh ON sh.id = shipi.shipment_id "
            + " JOIN `order` po ON po.id = shipi.order_id "
            + " JOIN product prod ON prod.MPN = po.MPN "
            + " WHERE po.group LIKE ? AND sh.shipmentdate >= ?"
            + " ORDER BY shipmentdate DESC, sh.id DESC;"
            , [req.param('id'), req.param('startDate')],
        function(err, recs) {
            if (err) console.log(err);
            res.send(recs);
        });
    },


    /**
    * `Database/getController.shipmentitems()`
    */
    outgoingShipmentsStatus: function (req, res) {
        // Gets recent shipments for a company. "SHIPMENT/SHOWALL"
        Shipmentitem.query(
            "SELECT shipi.*, sh.shipmentdate, sh.driver, sh.truck, sh.shipment_no, sh.id as shipment_id, sh.checked, po.price, po.orderID, invi.id as invoiceitem_id, inv.id as invoice_id, inv.invoicedate, inv.paid, inv.invoice_no, prod.*, shipi.id as shipmentitem_id "
            + " FROM shipmentitem shipi "
            + " LEFT JOIN invoiceitem invi ON shipi.id = invi.shipmentitem_id "
            + " LEFT JOIN invoice inv ON invi.invoice_id = inv.id "
            + " JOIN shipment sh ON sh.id = shipi.shipment_id "
            + " JOIN `order` po ON po.id = shipi.order_id "
            + " JOIN product prod ON prod.MPN = po.MPN "
            + " WHERE sh.shipmentdate >= ? AND po.is_sale = 1"
            + " ORDER BY shipmentdate DESC, sh.id DESC;"
            , [req.param('startDate')],
        function(err, recs) {
            if (err) console.log(err);
            res.send(recs);
        });
    },


    /**
    * `Database/getController.activityreport()`
    */
    activityreport: function (req, res) {
        // Request with specific order enters here. "ORDER/SHOW"
        if ('po_id' in req.params.all()) {
            Shipmentitem
            .find({order_id: req.param('po_id')})
    //        .populate('order_id')
            .populate('shipment_id')
            .exec(function (err, records) {
                if (err) { res.send(err); return; }
                res.send(records);
            });
            return;
        }
        // Gets recent shipments for a company. "SHIPMENT/SHOWALL"
        Shipmentitem.query(
            "SELECT shipi.*, sh.shipmentdate, sh.shipment_no, po.price, po.orderID, invi.id as invoiceitem_id, inv.id as invoice_id, inv.invoicedate, inv.paid, inv.invoice_no, prod.* "
            + " FROM shipmentitem shipi "
            + " LEFT JOIN invoiceitem invi ON shipi.id = invi.shipmentitem_id "
            + " LEFT JOIN invoice inv ON invi.invoice_id = inv.id "
            + " JOIN shipment sh ON sh.id = shipi.shipment_id "
            + " JOIN `order` po ON po.id = shipi.order_id "
            + " JOIN product prod ON prod.MPN = po.MPN "
            + " WHERE po.group LIKE ? AND sh.shipmentdate >= ? AND sh.shipmentdate <= ?"
            + " ORDER BY shipmentdate, sh.id;"
            , [req.param('id'), req.param('startDate'), req.param('endDate')],
        function(err, recs) {
            if (err) console.log(err);
            res.send(recs);
        });
    },


    /**
    * `Database/getController.invoices()`
    */
    invoices: function (req, res) {
        return res.json({
        todo: 'invoices() is not implemented yet!'
        });
    },


    /**
    * `Database/getController.invoiceitems()`
    */
    invoiceitems: function (req, res) {
        // Request with specific order enters here. "ORDER/SHOW"
        if ('po_id' in req.params.all()) {
            Shipmentitem
            .find({order_id: req.param('po_id')})
    //        .populate('order_id')
            .populate('shipment_id')
            .exec(function (err, records) {
                if (err) { res.send(err); return; }
                res.send(records);
            });
            return;
        }

        // Gets recent shipments for a company. "SHIPMENT/SHOWALL"
        Shipmentitem.query(
            "SELECT shipi.*, sh.shipmentdate, inv.invoicedate, inv.buyer, "
            + " inv.seller, sh.shipment_no, po.price, po.orderID, "
            + " invi.id as invoiceitem_id, inv.id as invoice_id, inv.paid, inv.invoice_no, prod.* "
            + " FROM shipmentitem shipi "
            + " LEFT JOIN invoiceitem invi ON shipi.id = invi.shipmentitem_id "
            + " LEFT JOIN invoice inv ON invi.invoice_id = inv.id "
            + " JOIN shipment sh ON sh.id = shipi.shipment_id "
            + " JOIN `order` po ON po.id = shipi.order_id "
            + " JOIN product prod ON prod.MPN = po.MPN "
            + " WHERE inv.invoice_no LIKE ? AND po.group LIKE ? "
            + " ORDER BY shipmentdate DESC, sh.id DESC;", [req.param('invoice_no'), req.param('id')],
        function(err, recs) {
            if (err) console.log(err);
            res.send(recs);
        });
    },


    /**
    * `Database/getController.last_invoice_number()`
    */
    last_invoice_number: function (req, res) {
        Invoice.findOne({buyer: req.param('br_name')})
        .sort('invoicedate desc')
        .exec(function (err, rec) {
            if (err) { res.send(err); return; }
            res.send(rec);
        });
    }
};

