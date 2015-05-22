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
        var newRecord = req.param('product');
        
        // Blank name IDs are not allowed.
        newRecord.MPN = String(Math.round(Math.random()*100000000)+100);
        
        Product.create(newRecord, function(err, rec) {
            if (err) { res.send(err); return; }
            
            res.send(rec);
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
     * `Database/saveController.shipment()`
     */
    multipleshipments: function (req, res) {
        var items = req.param('items');
        console.log(items);
        
        //Ensure quantity is an integer and not string.
        //Ensure date is a Date object and sortable.
        for (var i=0; i<items.length; i++) {
            items[i].qty = parseInt(items[i].qty);
            items[i].orderdate = new Date(items[i].orderdate);
            items[i].shipmentdate = new Date(items[i].shipmentdate);
        }
        
        var POsort = function(array) {
            array.sort(function(a, b){return a.qty-b.qty});
            array.sort(function(a, b){return a.orderdate-b.orderdate});
        };
        var SHIPsort = function(array) {
            array.sort(function(a, b){return a.shipmentnote.localeCompare(b.shipmentnote)});
            array.sort(function(a, b){return a.shipment_no.localeCompare(b.shipment_no)});
            array.sort(function(a, b){return a.shipmentdate-b.shipmentdate});
        };

        Order.create(items, function(err, orders) {
            if (err) { res.send(err); return; }

            // NOTE: Returned records are not in the same order as 'items'!
            // Sort Orders and original Items in same way to match up IDs.
            POsort(orders);     
            POsort(items);
            // Add `order` ID to the item record.
            for (var i=0; i<items.length; i++) {
                items[i].order_id = orders[i].id;
//                console.log(items[i].qty == orders[i].qty, items[i].qty, orders[i].qty);
//                console.log(items[i].orderdate.toDateString() == orders[i].orderdate.toDateString(), items[i].orderdate.toDateString(), orders[i].orderdate.toDateString());
            }
            Shipment.create(items, function(err, shipments) {
                if (err) { res.send(err); return; }

                // Sort Shipments and original Items in same way to match up IDs.
                SHIPsort(shipments);
                SHIPsort(items);
                // Add `shipment` ID to the item record.
                for (var i=0; i<items.length; i++) {
                    items[i].shipment_id = shipments[i].id;
//                    console.log(items[i].shipmentnote == shipments[i].shipmentnote, items[i].shipmentnote, shipments[i].shipmentnote);
//                    console.log(items[i].shipment_no == shipments[i].shipment_no, items[i].shipment_no, shipments[i].shipment_no);
//                    console.log(items[i].shipmentdate.toDateString() == shipments[i].shipmentdate.toDateString(), items[i].shipmentdate.toDateString(), shipments[i].shipmentdate.toDateString());
                }
                Shipmentitem.create(items, function(err, shipmentitems) {
                    if (err) { res.send(err); return; }

                    res.send({shipmentitems: shipmentitems, orders: orders, shipments: shipments});
                });
            });
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
        var co_name = req.param('co_name');
        var invoice_data = req.param('invoice_data');
        var items = req.param('items');
        
        Invoice.create(invoice_data, function(err, inv) {
            if (err) { res.send(err); return; }

            // Add `invoice` ID to the item records.
            for (var i=0; i<items.length; i++) {
                items[i].invoice_id = inv.id;
            }
            Invoiceitem.create(items, function(err, inv_items) {
                if (err) { res.send(err); return; }

                res.send({inv_items: inv_items, inv: inv});
            });
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