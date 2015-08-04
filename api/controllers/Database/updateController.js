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
            Product.update(editRecord.MPN, editRecord, function(err, rec) {
                if (err) { res.send(err); return; }

                res.send(rec);
            });
        }
    },


    /**
    * `Database/updateController.branch()`
    */
    branch: function (req, res) {
        return res.json({
            todo: 'branch() is not implemented yet!'
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
};

