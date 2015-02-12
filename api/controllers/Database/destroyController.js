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
        return res.json({
            todo: 'branch() is not implemented yet!'
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
        return res.json({
            todo: 'order() is not implemented yet!'
        });
    },


    /**
     * `Database\destroyController.product()`
     */
    product: function (req, res) {
        return res.json({
            todo: 'product() is not implemented yet!'
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
        return res.json({
            todo: 'invoice() is not implemented yet!'
        });
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