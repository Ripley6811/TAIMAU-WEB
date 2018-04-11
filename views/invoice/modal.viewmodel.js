function InvoiceModalVM() {
    var self = this,
        _csrf = viewModel._csrf,
        tax_rate = 0.05;

    /**
     * Visibility of this modal div.
     */
    self.isVisible = ko.observable(false);
    self.edit_mode = ko.observable(false);
    self.invoice_id = ko.observable();
    self.invoice_item_ids = [];

    self.aggregateItems = ko.observableArray();
    self.invoiceItems = ko.observableArray();
    self.invoicenote = ko.observable();
    self.invoice_no = ko.observable('');
    self.us = ko.observable();
    self.them = ko.observable('');
    self.is_sale = ko.observable(true);
    var date_today = new Date();
    self.inv_year = ko.observable(date_today.getFullYear()-1911);
    self.inv_month = ko.observable(date_today.getMonth()+1);
    self.inv_day = ko.observable(date_today.getDate());

    /**
     * Process a list of shipments for creating an invoice and show this modal.
     * @param {Array} items Array of shipment items.
     */
    self.showModal = function(items) {
        // Use order ID to preset the branch selections for the invoice.
        self.invoiceItems.removeAll();
        for (var i=0; i<items.length; i++) {
            self.invoiceItems.push(new KO_ShipmentListRow(items[i]));
            self.invoiceItems()[i].shipmentitem_id = items[i].shipmentitem_id;
            // Set the buyer and seller names
            if (['台茂','富茂','永茂','進侑企業'].indexOf(items[i].buyer) >= 0) {
                self.us(items[i].buyer);
                self.them(items[i].seller);
            } else {
                self.us(items[i].seller);
                self.them(items[i].buyer);
            }
            // Fill in all fields if this is an edit to existing invoice.
            if (items[i].invoice_no != undefined) {
                self.invoice_id(items[i].invoice_id);
                self.edit_mode(true);
                self.invoice_no(items[i].invoice_no);
                self.invoice_item_ids.push(items[i].invoiceitem_id);
                var date_today = new Date(items[i].invoicedate);
                self.inv_year(date_today.getFullYear()-1911);
                self.inv_month(date_today.getMonth()+1);
                self.inv_day(date_today.getDate());
            } else {
                // Prefill with shipment date
                var date_today = new Date(items[i].shipmentdate);
                self.inv_year(date_today.getFullYear()-1911);
                self.inv_month(date_today.getMonth()+1);
                self.inv_day(date_today.getDate());
            }
        }
        if (self.invoiceItems().length == 0) return;
        self.is_sale( self.invoiceItems()[0].is_supply ? false : true );
        if (self.invoice_no() == '') {
            self.invoice_no(self.lastInvoiceNumber().substring(0,6));
        }
        self.isVisible(true);
    };
    self.exitModal = function() {
        self.isVisible(false);
        // Clear/reset fields
        self.invoice_id(undefined);
        self.edit_mode(false);
        self.invoice_no('');
        var date_today = new Date();
        self.inv_year(date_today.getFullYear()-1911);
        self.inv_month(date_today.getMonth()+1);
        self.inv_day(date_today.getDate());
    };

    self.invoicedate = ko.computed(function () {
        var text = [parseInt(self.inv_year())+1911,
                    self.inv_month().length == 1 ? '0' + self.inv_month() : self.inv_month(),
                    self.inv_day().length == 1 ? '0' + self.inv_day() : self.inv_day()].join('-');
        return text;
    });

    self.aggregateItems = ko.observableArray();
    ko.computed(function () {
        var aggregator = {};
        for (var i=0; i<self.invoiceItems().length; i++) {
            var item = self.invoiceItems()[i];
            if (aggregator[item.MPN] !== undefined) {
                aggregator[item.MPN].x_qty += item.qty * (item.unitpriced ? item.units : 1);
                aggregator[item.MPN].value += item.value;
            } else {
                aggregator[item.MPN] = {
                    product_label: item.product_label,
                    x_qty: item.qty * (item.unitpriced ? item.units : 1),
                    x_um: item.unitpriced ? item.UM : item.SKU,
                    price: item.price,
                    value: item.value
                }
            }
        }
        self.aggregateItems.removeAll();
        for (var key in aggregator) {
            self.aggregateItems.push(aggregator[key]);
        }
    });

    // Check invoice number is all caps
    ko.computed(function () {
        self.invoice_no(self.invoice_no().toUpperCase());
    });
    // Check month is in range
    ko.computed(function () {
        if (parseInt(self.inv_month()) > 12)
            self.inv_month(self.inv_month().substring(0,1));
    });
    // Check day is reasonable
    ko.computed(function () {
        if (parseInt(self.inv_day()) > 32)
            self.inv_day(self.inv_day().substring(0,1));
    });

    // Before tax total
    self.subtotal = function() {
        var val = 0;
        for (var i=0; i<self.invoiceItems().length; i++) {
            val += self.invoiceItems()[i].value;
        }
        return val;
    }
    // Total tax to add
    self.taxtotal = function() {
        var val = self.subtotal() * tax_rate;
        return Math.round(val);
    }
    // Total after tax
    self.grandtotal = function() {
        return self.subtotal() + self.taxtotal();
    }

    self.invoice = new KO_Invoice();
    self.onModalClose = null; // Callback to execute when modal closes.



    self.doSubmit = function() {
        if (!self.edit_mode() && self.invoice_id() == undefined) {
            var is_purchase = self.invoiceItems()[0].is_supply;
            var invoice = {
                invoice_no: self.invoice_no,
                seller: self.is_purchase ? self.them() : self.us(),
                buyer: self.is_purchase ? self.us() : self.them(),
                invoicedate: self.invoicedate,
                invoicenote: self.invoicenote
            };
            var items = [];
            for (var i=0; i<self.invoiceItems().length; i++) {
                var invoiceItem = self.invoiceItems()[i];
    //            console.log(invoiceItem);
                items.push({
                    shipmentitem_id: invoiceItem.shipmentitem_id,
                    order_id: invoiceItem.order_id,
                    qty: invoiceItem.qty
                });
            }
            var params = {
                _csrf: _csrf,
                co_name: viewModel.co_name,
                invoice_data: invoice,
                items: items
            };
            post('/database/save/invoice', params, function(res) {
//                console.log(res);
                if ('error' in res) alert(res.error);
                else window.location = '../showall/'+viewModel.co_name;
            });
        }
    };

    self.delete_invoice = function() {
        if (self.edit_mode() && self.invoice_id() != undefined) {
            var c = confirm('Are you sure you want to delete this invoice?');
            if (c == false) return;

            var item_ids = []
            for (var i=0; i<self.invoice_item_ids.length; i++) {
                item_ids.push(self.invoice_item_ids[i]);
            }
            var params = {
                _csrf: _csrf,
                delete_id: self.invoice_id(),
                delete_item_ids: item_ids,
            };
            post('/database/destroy/invoice', params, function(res) {
                console.log(res);
                if ('error' in res) alert('ERROR: See console output');
                else window.location = '../showall/'+viewModel.co_name;
            });
        }
    };

    self.lastInvoiceNumber = ko.observable('');
    // Update last invoice number when branch is selected.
    ko.computed(function () {
        if (!self.edit_mode() && self.invoice_id() == undefined) {
            var params = {
                _csrf: _csrf,
                co_name: viewModel.co_name,
                br_name: self.them()
            };
            post('/database/get/last_invoice_number', params, function(res) {
                if ('error' in res) alert(res);
                if (res) self.lastInvoiceNumber(res.invoice_no);
            });
        }
    });
}

viewModel.invoiceModalVM = new InvoiceModalVM();
