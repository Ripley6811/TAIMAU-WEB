
var cogroup = <%- JSON.stringify(cogroup) %>;
var co_name = viewModel.co_name = '<%= cogroup.name %>';
var _csrf = '<%= _csrf %>';


var key = {
    ESC: 27,
    ENTER: 13,
    PLUS: 43
};

viewModel.ShowAllShipmentsVM = new (function () {
    'use strict';
    var self = this;

    self.debug = false;  // Show database ID numbers in all cases if true
    var d = new Date();
    d.setMonth(d.getMonth() - 2);
//    self.dateStart = ko.observable(d.toISOString().substring(0, 10));
    self.nRecsShown = ko.observable(50);

    /**
     * SHIPMENT methods
     */
    self.shipments = ko.observableArray();
    self.shipmentsItems = ko.observableArray();
    self.invoiceNoRowSpans = ko.observableArray();
    self.shipmentNoRowSpans = ko.observableArray();

    self.clearSelections = function() {
        for (var i=0; i<self.shipmentsItems().length; i++) {
            self.shipmentsItems()[i].selected(false);
        }
    };

    self.calcInvoiceNoRowSpan = function(index) {
        var invoice_no = self.shipmentsItems()[index].invoice_no;
        if (index > 0 && invoice_no != undefined && self.shipmentsItems()[index-1].invoice_no === invoice_no) {
            return 0;
        } else if (invoice_no != undefined) {
            var rows = 1;
            while (self.shipmentsItems()[index+1] != undefined && invoice_no === self.shipmentsItems()[index+1].invoice_no) {
                rows += 1;
                index += 1;
            }
            return rows;
        } else return 1;
    }

    self.calcShipmentNoRowSpan = function(index) {
        var shipment_no = self.shipmentsItems()[index].shipment_no;
        if (index > 0 && shipment_no != undefined && self.shipmentsItems()[index-1].shipment_no === shipment_no) {
            return 0;
        } else if (shipment_no != undefined) {
            var rows = 1;
            while (self.shipmentsItems()[index+1] != undefined && shipment_no === self.shipmentsItems()[index+1].shipment_no) {
                rows += 1;
                index += 1;
            }
            return rows;
        } else return 1;
    }

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
            id: co_name,
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

    document.onkeydown = function(evt) {
        // Exit any modal if displayed.
        if (evt.keyCode == key.ESC) {
            if (viewModel.invoiceModalVM.isVisible()) viewModel.invoiceModalVM.exitModal();
            else self.clearSelections();
        }
        // Enter the normal shipment form.
        if (evt.keyCode == key.ENTER) {
            if (viewModel.invoiceModalVM.isVisible()) return true;
            else self.openInvoiceModal();
        }
    };



    self.getShipmentsArray = ko.computed(function() {
        var params = {
            _csrf: _csrf,
            id: co_name,
            limit: parseInt(self.nRecsShown()),
        };
        post('/database/get/shipmentitems', params, function(response) {
            self.shipmentsItems.removeAll();
            for (var i=0; i<response.length; i++) {
                self.shipmentsItems.push(new KO_ShipmentListRow(response[i]));
            }

            self.invoiceNoRowSpans.removeAll();
            self.shipmentNoRowSpans.removeAll();
            for (var i=0; i<self.shipmentsItems().length; i++) {
                self.invoiceNoRowSpans.push(self.calcInvoiceNoRowSpan(i));
                self.shipmentNoRowSpans.push(self.calcShipmentNoRowSpan(i));
            }

            // Activate Bootstrap's tooltips (opt-in function).
            $('[data-toggle="tooltip"]').tooltip();
        });
    });

    // Set the header cell widths to match the body cell widths
    ko.computed(function () {
        if (self.invoiceNoRowSpans().length > 0) {
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
    };

    self.update_payment = function (item) {

    };
});
