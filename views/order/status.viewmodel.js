viewModel.StatusVM = new (function () {
    'use strict';
    var self = this,
        _csrf = viewModel._csrf;

    self.debug = false;  // Show database ID numbers in all cases if true
    var d = new Date();
    d.setMonth(d.getMonth() - 2);
    self.dateStart = ko.observable(d.toISOString().substring(0, 10));

    /**
     * SHIPMENT methods
     */
    self.shipments = ko.observableArray();
    self.shipmentsItems = ko.observableArray();

    self.clearSelections = function() {
        for (var i=0; i<self.shipmentsItems().length; i++) {
            self.shipmentsItems()[i].selected(false);
        }
    };

    self.openInvoiceModal = function() {
        var items = [];
        for (var i=0; i<self.shipmentsItems().length; i++) {
            var si = self.shipmentsItems()[i];
            if (si.selected() && si.invoiceitem_id == null) {
                items.push(si);
            }
        }
        viewModel.invoiceModalVM.showModal(items);
    };

    self.view_invoice = function(invoice_btn_data) {
        var params = {
            _csrf: _csrf,
            id: invoice_btn_data.group, // TODO: check how this works
            invoice_no: invoice_btn_data.invoice_no,
        };
        post('/database/get/invoiceitems', params, function(response) {


            var items = [];
            for (var i=0; i<response.length; i++) {
                items.push(response[i]);
            }
            viewModel.invoiceModalVM.showModal(items);
        });
    };
    
    self.sortByManifests = function () {
        self.shipmentsItems.sort(function (a, b) {
            var p = 'shipment_no';
            // Empty PN strings at end of list
            if (a[p].length < 1 && b[p].length < 1) return 0;
            if (a[p].length < 1 || b[p].length < 1) return (a[p] > b[p] ? -1 : 1);
            // Else sort by PN
            return (Number(a[p]) < Number(b[p]) ? 1 : -1);
        });
    }


    self.getShipmentsArray = ko.computed(function() {
        var params = {
            _csrf: _csrf,
            startDate: self.dateStart(),
        };
        post('/database/get/outgoingShipmentsStatus', params, function(response) {

            self.shipmentsItems.removeAll();
            for (var i=0; i<response.length; i++) {
                self.shipmentsItems.push(new KO_ShipmentListRow(response[i]));
            }
            self.sortByManifests();
        });
    });

    // Set the header cell widths to match the body cell widths
    ko.computed(function () {
        if (self.shipmentsItems().length > 0) {
            var ths = document.getElementById('showall-th').getElementsByTagName('th');
            var tds = document.getElementById('showall-td').getElementsByTagName('td');
            if (tds.length >= ths.length) {
                for (var i = 0; i < ths.length; i++) {
                    ths[i].style.width = tds[i].offsetWidth + 'px';
                }
            }
            // Edit body starting offset from header
            var panel_head = document.getElementById("showall-p-head");
            var panel_body = document.getElementById("showall-p-body");
            panel_body.style.marginTop = panel_head.offsetHeight + 'px';
        }
    });

    self.open_shipment_pdf = function (item) {
        window.location = '/shipment/pdf/' + item.shipment_id;
    }

    self.toggleChecked = function (item) {
        var shipment_id = item.shipment_id,
            new_bool = !item.checked.peek();


        var params = {
            _csrf: _csrf,
            id: shipment_id,
            checked: new_bool,
            group: item.group
        };
        post('/database/update/shipmentChecked', params, function (response) {

            if (response.id === shipment_id) {
                var sitems = self.shipmentsItems.peek();
                for (var i=0; i<sitems.length; i++) {
                    if (sitems[i].shipment_id === shipment_id) {
                        sitems[i].checked(new_bool);
                    }
                }
            }
        });
    };
});