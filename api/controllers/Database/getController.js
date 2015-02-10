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
        Product
        .find({group: req.param('id')})
        .exec(function (err, records) {
            if (err) { res.send(err); return; }
            res.send(records);
        });
    },


    /**
    * `Database/getController.orders()`
    */
    orders: function (req, res) {
        var group = req.param('id'),
            page = req.param('page') || 1,
            limit = req.param('limit') || 100;
        
        Order
        .find({group: group})
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
        return res.json({
        todo: 'shipments() is not implemented yet!'
        });
    },


    /**
    * `Database/getController.shipmentitems()`
    */
    shipmentitems: function (req, res) {
        Shipmentitem
        .find({order_id: req.param('id')})
        .populate('order_id')
        .populate('shipment_id')
        .exec(function (err, records) {
            if (err) { res.send(err); return; }
            res.send(records);
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
        return res.json({
        todo: 'invoiceitems() is not implemented yet!'
        });
    }
};

