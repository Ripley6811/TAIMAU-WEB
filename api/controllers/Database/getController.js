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
            limit = req.param('limit') || 50;
        
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
        Shipmentitem
        .find({order_id: req.param('id')})
//        .populate('order_id')
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

