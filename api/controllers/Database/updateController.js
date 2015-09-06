/**
 * Database/updateController
 *
 * @description :: Server-side logic for managing database/updates
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {



    /**
    * `Database/updateController.product()`
    */
    product: function (req, res) {
        var editRecord = req.param('product');

        console.log(editRecord.MPN);

        if (editRecord.MPN) {
            Product.update(editRecord.MPN, editRecord, function(err, recs) {
                if (err) { res.send(err); return; }

                res.json(recs);
            });
        }
    },


    /**
    * `Database/updateController.cogroup()`
    */
    cogroup: function (req, res) {
        console.log(req.allParams());

        Cogroup.update(req.param('id'), req.param('cogroup'), function(err, recs) {
            if (err) { res.send(err); return; }

            res.json(recs);
        });
    },


    /**
    * `Database/updateController.branch()`
    */
    branch: function (req, res) {
        console.log(req.allParams());

        Branch.update(req.param('id'), req.param('branch'), function(err, recs) {
            if (err) { res.send(err); return; }

            res.json(recs);
        });
    },


    /**
    * `Database/updateController.order()`
    */
    order: function (req, res) {
        var editRecord = req.param('order');

        if (editRecord.id) {
            Order.update(editRecord.id, editRecord, function(err, rec) {
                if (err) { res.send(err); return; }

                res.send(rec[0]);
            });
        }
    },


    /**
    * `Database/updateController.shipmentChecked()`
    * params:
    *   id = shipment database ID
    *   checked = boolean to update
    */
    shipmentChecked: function (req, res) {
        var sid = req.param('id');

        Shipment.findOne(sid)
        .exec(function (err, rec) {
            if (err) res.send(err);
            // Update checked status and group name if missing
            rec.checked = req.param('checked');
            if (rec.group === null) {
                rec.group = req.param('group');
            }
            // Save and return updated rec
            rec.save(function (err, rec) {
                if (err) res.send(err);
                res.send(rec);
            });
        });
    },




    /**
    * `Database/updateController.shipmentDriver()`
    * params:
    *   id = shipment database ID
    *   driver = string
    */
    shipmentDriver: function (req, res) {
        var sid = req.param('id');

        Shipment.findOne(sid)
        .exec(function (err, rec) {
            if (err) res.send(err);
            // Update driver and group name if missing
            rec.driver = req.param('driver');
            if (rec.group === null) {
                rec.group = req.param('group');
            }
            // Save and return updated rec
            rec.save(function (err, rec) {
                if (err) res.send(err);
                res.send(rec);
            });
        });
    },




    /**
    * `Database/updateController.shipmentItemQty()`
    * params:
    *   id = shipment database ID
    *   qty = int
    */
    shipmentItemQty: function (req, res) {
        var sid = req.param('id');

        Shipmentitem.findOne(sid)
        .exec(function (err, rec) {
            if (err) res.send(err);
            // Update qty
            rec.qty = req.param('qty');

            // Save and return updated rec
            rec.save(function (err, rec) {
                if (err) res.send(err);
                res.send(rec);
            });
        });
    },




    /**
    * `Database/updateController.orderPrice()`
    * params:
    *   id = order database ID
    *   price = float
    */
    orderPrice: function (req, res) {
        var oid = req.param('id');

        Order.findOne(oid)
        .exec(function (err, rec) {
            if (err) res.send(err);
            // Update qty
            rec.price = req.param('price');

            // Save and return updated rec
            rec.save(function (err, rec) {
                if (err) res.send(err);
                res.send(rec);
            });
        });
    },




    /**
    * `Database/updateController.check_no()`
    * params:
    *   id = invoice database ID
    *   check_no = string
    */
    check_no: function (req, res) {
        var invoice_id = req.param('id');

        Invoice.findOne(invoice_id)
        .exec(function (err, rec) {
            if (err) res.send(err);
            // Update check_no
            rec.check_no = req.param('check_no');

            // Save and return updated rec
            rec.save(function (err, rec) {
                if (err) res.send(err);
                res.send(rec);
            });
        });
    },




    /**
    * `Database/updateController.toggleSupplier()`
    * params:
    *   id = company group database id (abbr. name)
    */
    toggleSupplier: function (req, res) {
        var id = req.param('id');

        Cogroup.findOne(id)
        .exec(function (err, rec) {
            if (err) res.send(err);
            // Update status
            rec.is_supplier = !rec.is_supplier;

            // Save and return updated status value
            rec.save(function (err, rec) {
                if (err) res.send(err);

                res.send(rec.is_supplier);
            });
        });
    },




    /**
    * `Database/updateController.toggleSupplier()`
    * params:
    *   id = company group database id (abbr. name)
    */
    toggleCustomer: function (req, res) {
        var id = req.param('id');

        Cogroup.findOne(id)
        .exec(function (err, rec) {
            if (err) res.send(err);
            // Update status
            rec.is_customer = !rec.is_customer;

            // Save and return updated status value
            rec.save(function (err, rec) {
                if (err) res.send(err);

                res.send(rec.is_customer);
            });
        });
    },
};

