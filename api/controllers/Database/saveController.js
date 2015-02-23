/**
 * Database/saveController
 *
 * @description :: Server-side logic for managing database/saves
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {



    /**
     * `Database/saveController.cogroup()`
     */
    cogroup: function (req, res) {
        return res.json({
            todo: 'cogroup() is not implemented yet!'
        });
    },


    /**
     * `Database/saveController.branch()`
     */
    branch: function (req, res) {
        var co_name = req.param('co_name'),
            branch = req.param('branch');
        console.log(req.params.all());
        // Blank name IDs are not allowed.
        if (branch.name === '') {
            res.send(false);
            return false;
        }

        Branch.findOrCreate({name: branch.name, group: co_name}, branch)
        .exec(function(err, rec) {
            if (err) {
                res.send(err);
                return false;
            }
            
            console.log('BRANCH FINDorCREATE:', typeof rec, rec);
            
            Branch.update({name: branch.name, group: co_name}, branch)
            .exec(function (err, recs) {
                if (err) {
                    res.send(err);
                    return false;
                }

//                console.log('BRANCH UPDATE:', typeof recs, recs);
                res.send(recs[0]);
            });
        });
    },


    /**
     * `Database/saveController.contact()`
     */
    contact: function (req, res) {
        return res.json({
            todo: 'contact() is not implemented yet!'
        });
    },


    /**
     * `Database/saveController.product()`
     */
    product: function (req, res) {
        return res.json({
            todo: 'product() is not implemented yet!'
        });
    },


    /**
     * `Database/saveController.shipment()`
     */
    shipment: function (req, res) {
        return res.json({
            todo: 'shipment() is not implemented yet!'
        });
    },


    /**
     * `Database/saveController.shipmentitem()`
     */
    shipmentitem: function (req, res) {
        console.log('SAVE/SHIPMENTITEM/', req.params.all());
        var co_name = req.param('co_name'),
            item = req.param('item');
        
        var shipmentRecord = {
            shipmentdate: new Date(item.shipdate ? item.shipdate : item.duedate),
            shipment_no: item.shipment_no,
            group: co_name,
        };
        
        var itemRecord = {
            order_id: item.order_id,
            qty: item.qty,
            duedate: new Date(item.duedate),
            shipped: item.shipdate ? true : false,
        }
        console.log('NEW Shipment:', shipmentRecord);
        console.log('NEW Item record:', itemRecord);
        console.log('DATES:', item.shipdate, new Date(item.shipdate));
        var update = function () {
            console.log('UPDATE', item.id);
            // Check for shipment id match, findOrCreate shipment.
            Shipment.findOrCreate(shipmentRecord, shipmentRecord)
            .exec(function (err, rec) {
                if (err) { res.json(err); return; }
                // Submit updates.
                itemRecord.shipment_id = rec.id;
                Shipmentitem.update({id: item.id}, itemRecord)
                .exec(function (err, rec2) {
                    if (err) { res.json(err); return; }
                    
                    res.send({updated: true, shipment: rec, shipmentitem: rec2});
                });
            });
        };
        
        var create = function () {
            console.log('CREATE', item);
            // Create shipment.
            Shipment.findOrCreate(shipmentRecord, shipmentRecord)
            .exec(function (err, rec) {
                if (err) { res.json(err); return; }
                // Create shipment item.
                itemRecord.shipment_id = rec.id;
                Shipmentitem.create(itemRecord)
                .exec(function (err, rec2) {
                    if (err) { res.json(err); return; }
                    
                    res.send({created: true, shipment: rec, shipmentitem: rec2});
                });
            });
        };
        
        if ('id' in item) update();
        else create();
    },


    /**
     * `Database/saveController.invoice()`
     */
    invoice: function (req, res) {
        return res.json({
            todo: 'invoice() is not implemented yet!'
        });
    },


    /**
     * `Database/saveController.invoiceitem()`
     */
    invoiceitem: function (req, res) {
        return res.json({
            todo: 'invoiceitem() is not implemented yet!'
        });
    },


    /**
     * `Database/saveController.order()`
     */
    order: function (req, res) {
        return res.json({
            todo: 'order() is not implemented yet!'
        });
    }
};