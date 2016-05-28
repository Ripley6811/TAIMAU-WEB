var cogroup = new KO_Cogroup(<%- JSON.stringify(cogroup) %>),
    order = new KO_PurchaseOrder(<%- JSON.stringify(order.MPN) %>,
                                 <%- JSON.stringify(order) %>),
    po_ID = <%= id %>;

function PageModel() {
    var self = this,
        co_name = viewModel.co_name,
        _csrf = viewModel._csrf;


    /**
     * SHIPMENTITEM section controls
     *
     *
     */
    self.items = ko.observableArray();
    self.toggleShipped = function(item) {
        item.shipped(!item.shipped());

        var index = self.items().indexOf(item);
        self.itemsUpdate(self.items.slice(index, index+1));
    }
    self.addNewItemRow = function() {
        var newItem = new KO_ShipmentItem();
        newItem.order_id = po_ID;
        newItem.saved(false);
        self.items.unshift(newItem);
    };
    self.removeitem= function(item) {
        var params = {
            _csrf: _csrf,
            co_name: co_name,
            id: item.id,
            order_id: po_ID,
        };
        post(
            '/database/destroy/shipmentitem',
            params,
            function (response) {
                if (response.status !== 400 && response.order_id === po_ID) {
                    item.id = undefined;
                    item.saved(false);
                    self.items.remove(item);
                } else {
                    if (response.raw && response.raw.code === 'ER_ROW_IS_REFERENCED_2') {
                        alert('An invoice was found for this record. \nThis record cannot be deleted.');
                    } else alert(JSON.stringify(response, null, '  '));
                }
            }
        );
    };

    self.saveitem = function(item) {
        item.saved(true);
        var params = {
            _csrf: _csrf,
            co_name: co_name,
            item: item
        };
        post(
            '/database/save/shipmentitem',
            params,
            function (response) {
                if (response.status !== 400 && 'shipmentitem' in response) {
                    item.id = response.shipmentitem.id;
                    item.shipment = response.shipment;
                    item.shipment_no(response.shipment.shipment_no);
                    item.shipped(response.shipmentitem.shipped);
                    item.saved(true);
                    if ('created' in response) self.addNewItemRow();
                } else {
                    item.saved(false);
                    alert(JSON.stringify(response, null, '  '));
                }
            }
        );
    };

    self.itemsGet = function () {
        var params = {
                _csrf: _csrf,
                po_id: po_ID,
        };
        post(
            '/database/get/shipmentitems',
            params,
            function (response) {
                response.sort(function (a,b) {
                    return new Date(b.shipment_id.shipmentdate) - new Date(a.shipment_id.shipmentdate);
                });
                self.items.removeAll();
                for (var i=0; i<response.length; i++) {
                    self.items.push(new KO_ShipmentItem(response[i]));
                }
                self.addNewItemRow();
            }
        );
    };

    self.itemsGet();



    self.itemsGet22 = function () {
        var params = {
                _csrf: _csrf,
                id: po_ID,
        };
        post(
            '/database/get/shipments',
            params,
            function (response) {
                console.log('DONE');
            }
        );
    };

    self.itemsGet22();
}

viewModel.pageVM = new PageModel();