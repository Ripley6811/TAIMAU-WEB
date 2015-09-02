/**
 * Database\destroyController
 *
 * @description :: Server-side logic for managing database\destroys
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {



    /**
     * `Database\destroyController.cogroup()`
     */
    cogroup: function (req, res) {
        return res.json({
            todo: 'cogroup() is not implemented yet!'
        });
    },


    /**
     * `Database\destroyController.branch()`
     */
    branch: function (req, res) {
        console.log(req.allParams());

        Branch.destroy(req.param('id'), function(err, rec) {
            if (err) { res.send(err); return; }

            res.json(rec);
        });
    },


    /**
     * `Database\destroyController.contact()`
     */
    contact: function (req, res) {
        return res.json({
            todo: 'contact() is not implemented yet!'
        });
    },


    /**
     * `Database\destroyController.order()`
     */
    order: function (req, res) {
        var co_name = req.param('co_name'),
            order = req.param('order');

        Order.destroy({id: order.id, group: co_name})
        .exec(function (err, records) {
            if (err) {
                res.send(err);
            } else if (records.length > 1) {
                res.send({'err': 'Too many records deleted',
                          'records': records});
            } else if (records.length == 1) {
                res.send(records[0]);
            } else res.send({err: err, records: records});
        });
    },


    /**
     * `Database\destroyController.product()`
     */
    product: function (req, res) {
        console.log(req.allParams());

        Branch.destroy(req.param('id'), function(err, rec) {
            if (err) { res.send(err); return; }

            res.json(rec);
        });
    },


    /**
     * `Database\destroyController.shipment()`
     */
    shipment: function (req, res) {
        return res.json({
            todo: 'shipment() is not implemented yet!'
        });
    },


    /**
     * `Database\destroyController.shipmentitem()`
     *
     * Returns the single record if successful. Otherwise returns the error
     * and records array.
     */
    shipmentitem: function (req, res) {
        console.log('DESTROY/SHIPMENTITEM', req.params.all());
        var id = req.param('id'),
            order_id = req.param('order_id');

        if (isNaN(Number(id))) {
            res.send('ID is not a number');
        }

        Shipmentitem.destroy({id: id, order_id: order_id})
        .exec(function (err, records) {
            if (err) {
                res.send(err);
            } else if (records.length > 1) {
                res.send({'err': 'Too many records deleted',
                          'records': records});
            } else if (records.length == 1) {
                res.send(records[0]);
            } else res.send({err: err, records: records});
        });
    },


    /**
     * `Database\destroyController.invoice()`
     */
    invoice: function (req, res) {
        if (!isNaN(parseInt(req.param('delete_id')))) {
            Invoiceitem.destroy(req.param('delete_item_ids'))
            .exec(function (err, record) {
                if (err) res.send({error: err});
                else {
                    Invoice.destroy({id: req.param('delete_id')})
                    .exec(function (err, record) {
                        if (err) {
                            res.send({error: err});
                        } else {
                            res.send({record: record});
                        }
                    });
                }
            });
        }
    },


    /**
     * `Database\destroyController.invoiceitem()`
     */
    invoiceitem: function (req, res) {
        return res.json({
            todo: 'invoiceitem() is not implemented yet!'
        });
    }
};
