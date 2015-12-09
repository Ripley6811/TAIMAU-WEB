/**
 * @fileOverview KnockoutJS Models
 */

/**
 * @namespace
 */
var models = {
    /**
     * Order ViewModel
     * Ensure MPN is a product object.
     * Used on order/index page.
     * @param   {Object} data Order+Product data from database.
     * @returns {Object} Order ViewModel.
     */
    Order: function (data) {
        'use strict';
        // Assert MPN is a product object.
        if (typeof data.MPN !== "object") {
            alert('MPN is not an object');
        }
        // Convert data to KO observable object.
        var self = ko.mapping.fromJS(data);
        // Set extra UI control observables.
        self.isSelected = ko.observable(false);
        self.isEditing = ko.observable(false);
        self.isHidden = ko.observable(false);
        self.isConfirmingDelete = ko.observable(false);
        self.errorMessage = ko.observable();
        self.qtyRequested = ko.observable();
        self.qtyMeasure = function () {
            var p = this.MPN;  // Product object
            return p.units() === 1 ? p.UM() : p.SKU();
        };
        return self;
    },

    /**
     * Product ViewModel
     * Used on product/index page.
     * @param   {Object} data Product data from database.
     * @returns {Object} Product ViewModel.
     */
    Product: function (data) {
        'use strict';
        // Convert data to KO observable object.
        var self = ko.mapping.fromJS(data);
        // Set extra UI control observables.
        self.isSelected = ko.observable(false);
        self.isEditing = ko.observable(false);
        self.isConfirmingDelete = ko.observable(false);
        self.errorMessage = ko.observable();
        self.qtyRequested = ko.observable();
        self.requestUM = function () {
            return this.units() === 1 ? this.UM() : this.SKU();
        };
        self.restrictEditing = ko.observable(true);

        // Ask database if editing should be restricted.
        ko.computed(function () {
            var self = this,
                xhr = new XMLHttpRequest();
            if (self.MPN()) {
                xhr.open('GET', '/product/isrestricted/' + encodeURI(self.MPN()), true);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState !== 4) return;

                    var res = xhr.responseText;
                    if (res === 'false') {
                        self.restrictEditing(false);
                    }
                };
                xhr.send();
            }
        }, self)

        // Ask database for the latest used price.
        ko.computed(function () {
            var self = this,
                xhr = new XMLHttpRequest();
            if (self.MPN()) {
                xhr.open('GET', '/product/price/' + encodeURI(self.MPN()), true);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState !== 4) return;

                    var res = parseFloat(xhr.responseText);
                    if (!isNaN(res)) {
                        self.curr_price(res);
                    }
                };
                xhr.send();
            }
        }, self)

        return self;
    }
};

/**
 * Cogroup model
 * @constructor
 * @param   {Object} [data={}] - Add data for existing cogroup.
 */
function KO_Cogroup(data) {
    var self = this,
        data = data || {};

    self.name = ko.observable(data.name); // ID - Primary Key
    self.is_active = ko.observable(data.is_active);
    self.is_supplier = ko.observable(data.is_supplier);
    self.is_customer = ko.observable(data.is_customer);

    self.supplierStatus = ko.computed(function () {
        return self.is_supplier() === true ? "glyphicon glyphicon-ok btn btn-success" : "glyphicon glyphicon-remove btn btn-danger";
    });

    self.customerStatus = ko.computed(function () {
        return self.is_customer() === true ? "glyphicon glyphicon-ok btn btn-success" : "glyphicon glyphicon-remove btn btn-danger";
    });

    self.toggleCustomer = function () {
        self.is_customer(!self.is_customer());
        self.saveUpdate();
    };
    self.toggleSupplier = function () {
        self.is_supplier(!self.is_supplier());
        self.saveUpdate();
    };

    /**
     * Save changes to this entity to the database.
     */
    self.saveUpdate = function () {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState !== 4) return;

        };
        xmlhttp.open('POST', '/cogroup/update', true);
        xmlhttp.setRequestHeader('Content-type', 'application/json');
        xmlhttp.send(ko.toJSON({
            _csrf: _csrf,
            cogroup_update: self
        }));
    };
}

function KO_Branch(data) {
    var self = this,
        data = data || {};

    self.name = ko.observable(data.name || null); // ID - Primary Key
    self.group = ko.observable(data.group || null);
    self.fullname = ko.observable(data.fullname || '');
    self.english_name = ko.observable(data.english_name || '');
    self.tax_id = ko.observable(data.tax_id || '');
    self.phone = ko.observable(data.phone || '');
    self.fax = ko.observable(data.fax || '');
    self.email = ko.observable(data.email || '');
    self.note = ko.observable(data.note || '');
    self.address_office = ko.observable(data.address_office || '');
    self.address_shipping = ko.observable(data.address_shipping || '');
    self.address_billing = ko.observable(data.address_billing || '');
    self.address = ko.observable(data.address || '');
    self.is_active = ko.observable(data.is_active === undefined ? true : data.is_active);

    self.nameLock = ko.observable(true); // Set to true for new entries only.
    self.saved = ko.observable(true); // Set to false if any editing is done.

    // Listen for changes to the following.
    ko.computed(function () {
        self.fullname();
        self.english_name();
        self.tax_id();
        self.phone();
        self.fax();
        self.email();
        self.note();
        self.address_office();
        self.address_shipping();
        self.address_billing();
        // Activate the save button.
        self.saved(false);
    });

    self.saved(true);
}

function KO_Contact(data) {
    var self = this,
        data = data || {};

    self.id = ko.observable(data.id || null); // ID - Primary Key
    self.group = ko.observable(data.group || null);
    self.branch = ko.observable(data.branch || '');
    self.name = ko.observable(data.name || '');
    self.position = ko.observable(data.position || '');
    self.phone = ko.observable(data.phone || '');
    self.cell = ko.observable(data.cell || '');
    self.fax = ko.observable(data.fax || '');
    self.email = ko.observable(data.email || '');
    self.note = ko.observable(data.note || '');

    self.saved = ko.observable(true); // Set to false if any editing is done.

    // Listen for changes to the following.
    ko.computed(function () {
        self.branch();
        self.name();
        self.position();
        self.phone();
        self.cell();
        self.fax();
        self.email();
        self.note();
        // Activate the save button.
        self.saved(false);
    });

    self.saved(true);
}

var glyph_ban = '<font color="red"><span class="glyphicon glyphicon-ban-circle"></span></font>';
var glyph_ok = '<font color="green"><span class="glyphicon glyphicon-ok"></span></font>';

function KO_Product(data) {
    var self = this,
        data = data || {};

    self.MPN = ko.observable(data.MPN || null); // ID - Primary Key
    self.group = ko.observable(data.group || null);
    self.product_label = ko.observable(data.product_label || '');
    self.inventory_name = ko.observable(data.inventory_name || '');
    self.english_name = ko.observable(data.english_name || '');
    self.units = ko.observable(data.units || 25).extend({ numeric: 3 });
    self.UM = ko.observable(data.UM || '');
    self.SKU = ko.observable(data.SKU || '');
    self.SKUlong = ko.observable(data.SKUlong || '');
    self.note = ko.observable(data.note || '');
    self.ASE_PN = ko.observable(data.ASE_PN || '');
    self.ASE_RT = ko.observable(data.ASE_RT || '');
    self.curr_price = ko.observable(data.curr_price);
    self.unitpriced = ko.observable(data.unitpriced === undefined ? true : data.unitpriced);
    self.unitcounted = ko.observable(data.unitcounted === undefined ? true : data.unitcounted);
    self.is_supply = ko.observable(data.is_supply === undefined ? false : data.is_supply);
    self.discontinued = ko.observable(data.discontinued === undefined ? false : data.discontinued);
    self.json = ko.observable(data.json || {});

    self.pricing = self.unitpriced() ? '/ ' + self.UM() : '/ ' + self.SKU();

    self.locked = ko.observable(true); // Set to true for new entries only.
    self.saved = ko.observable(true); // Set to false if any editing is done.

    // Listen for changes to the following.
    ko.computed(function () {
        self.inventory_name();
        self.product_label();
        self.english_name();
        self.SKUlong();
        self.note();
        self.ASE_PN();
        self.ASE_RT();
        self.curr_price();
        // Activate the save button.
        self.saved(false);
    });

    self.toggleMessage = ko.computed(function () {
        if (self.discontinued()) {
            return glyph_ban;
        } else {
            return glyph_ok;
        }
    });

    self.saved(true);

    self.selected = ko.observable(false);
}

function KO_PurchaseOrder(product, order) {
    var self = this;
    self.id = order.id;
    self.orderID = order.orderID;
    self.ordernote = ko.observable(order.ordernote);
    self.orderdate = ko.observable(toInputDate(order.orderdate));
    self.numberOfShipments = order.shipments ? order.shipments.length : undefined;
    self.qty_shipped = (function () {
        var total = 0;
        if (self.numberOfShipments === undefined) return total;
        for (var i=0; i<order.shipments.length; i++) {
            if (order.shipments[i].shipped) {
                total += order.shipments[i].qty;
            }
        }
        return total;
    })();
    self.MPN = product.MPN;
    self.is_supply = product.is_supply;
    self.is_open = ko.observable(order.is_open);
    self.label = product.product_label ? product.product_label : product.inventory_name;
    self.inventory_name = product.inventory_name;
    self.sku = product.SKU;
    self.guige = product.SKU;
    self.qty = ko.observable(order.qty ? order.qty : '');
    self.qty_remaining = self.qty() - self.qty_shipped;
    //    self.price = ko.observable(product.curr_price); // Why did i do this?
    self.price = ko.observable(order.price || null);
    self.applytax = ko.observable(order.applytax);
    self.um = product.UM;
    self.jianshu = self.sku !== '槽車' ? self.sku : self.um;
    self.id_note = product.note;
    self.units = parseFloat(product.units);
    if (self.guige !== '槽車') {
        self.guige = [self.units, self.um, '/', self.guige].join(' ');
    }

    self.pricing = product.unitpriced ? '/ ' + self.um : '/ ' + self.sku;

    self.totalUnits = ko.computed(function () {
        var val = parseInt(self.qty()) * self.units;
        if (!isNaN(val)) {
            return val.toString() + ' ' + self.um;
        } else {
            return '0 ' + self.um;
        }
    });

    self.total_value = ko.computed( function () {
        var total = parseInt(self.qty()) * parseFloat(self.price());
        if (product.unitpriced) {
            total = Math.round(total * self.units);
        }

        return total;
    });

    self.toggleMessage = ko.computed(function () {
        if (self.is_open()) {
            return glyph_ok;
        } else {
            return glyph_ban;
        }
    });

    self.selected = ko.observable(false);

    // Fill in the most recent price if blank.
    (function set_recent_price() {
        if (self.price() === null) {
            // AJAJ request for product record
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState !== 4) return;

                if (!xmlhttp.response) {
                    console.log("Get-recent-price response is empty");
                    return;
                }

                var recent_price = JSON.parse(xmlhttp.response);

                self.price(recent_price);
            };
            xmlhttp.open('GET', '/product/price/'+self.MPN, true);
            xmlhttp.send();
        }
    })();
}

function KO_Shipment(data) {
    var self = this;
    self.items = data.items;
    self.shipmentdate = data.shipmentdate;
    self.shipment_no = data.shipment_no;
    self.shipmentnote = data.shipmentnote;
    self.shipmentdest = data.shipmentdest;
    self.id = data.id;
    self.group = data.group;

    self.displayItems = ko.observable(false);
    self.toggleDisplay = function () {
        self.displayItems(!self.displayItems());
    }
    self.items = ko.observableArray();
    for (var i=0; i<data.items.length; i++) {
        self.items.push(new KO_ShipmentItem(data.items[i]));
    }
}

function KO_ShipmentItem(data) {
    var self = this,
        data = data || {},
        order = null,
        product = null,
        manifest = null;

    self.id = data.id;
    self.order_id = data.order_id;
    self.shipment = data.shipment_id;
    self.shipment_no = ko.observable(self.shipment ? self.shipment.shipment_no : undefined);
    self.shipmentnote = ko.observable(data.shipmentnote || '');

    self.qty = ko.observable(data.qty || '');
    self.lot = ko.observable(data.lot || '');
    self.duedate = ko.observable(toInputDate(data.duedate));
    self.shipped = ko.observable(data.shipped || false);

    self.shipdate = ko.observable(data.shipment_id !== undefined ? toInputDate(data.shipment_id.shipmentdate) : undefined);

    if (self.shipment_no() !== null && self.shipment_no() !== undefined) {
        self.shipped(true);
    }
    if (!self.shipped()) self.shipdate(undefined);
    self.saved = ko.observable(true);

    self.needToSave = ko.computed(function () {
        // Listen for changes to the following.
        self.qty();
        self.lot();
        self.duedate();
        self.shipped();
        self.shipdate();
        self.shipment_no();
        // Activate the save button.
        self.saved(false);
    });

    self.shippedHighlight = ko.computed(function () {
        return self.shipped();
    });

    self.saved(true);

}


function ShipmentItemRow(item) {
    var self = this;
    self.id = item.id || 'default'; // From PO if 'item' is PO
    self.MPN = item.MPN;
    self.is_supply = item.is_supply;
    self.price = item.price || item.curr_price;
    self.label = item.label || item.inventory_name;
    self.sku = item.sku || item.SKU;
    self.guige = item.sku || item.SKU;
    self.qty = ko.observable(item.qty ? item.qty : 'qty error');
    self.qtymax = item.qty ? Number(item.qty) : 10000000;
    self.um = item.um || item.UM;
    self.jianshu = self.sku !== '槽車' ? self.sku : self.um;
    self.id_note = item.id ? item.orderID + ' ' + item.ordernote : item.note;
    self.units = parseFloat(item.units);
    if (self.guige !== '槽車') {
        self.guige = [self.units, self.um, '/', self.guige].join(' ');
    }

    self.totalUnits = ko.computed(function () {
        var val = parseInt(self.qty()) * self.units;
        if (!isNaN(val)) {
            return val.toString() + ' ' + self.um;
        } else {
            return '0 ' + self.um;
        }
    });
}

/**
 * Model for row in all shipments listing.
 * @param {Object} item Database JSON object.
 */
function KO_ShipmentListRow(item) {
    var self = this;

    self.order_id = item.order_id;
    self.shipmentitem_id = item.shipmentitem_id;
    self.invoiceitem_id = item.invoiceitem_id;
    self.invoice_id = item.invoice_id;
    self.group = item.group;

    self.orderID = item.orderID;
    self.price = item.price;
    self.price_ko = ko.observable(item.price);
    self.is_supply = item.is_supply;
    self.MPN = item.MPN;

    self.SKU = item.SKU;
    self.unitpriced = item.unitpriced;
    self.units = item.units;
    self.UM = item.UM;

    self.inventory_name = item.inventory_name;
    self.product_label = item.product_label || item.inventory_name;
    self.qty = item.qty;
    self.qty_ko = ko.observable(item.qty);
    self.shipmentdate = new Date(item.shipmentdate);
    self.shipped = item.shipped ? true : false;
    self.shipment_no = item.shipment_no;
    self.shipment_id = item.shipment_id;
    self.driver = ko.observable(item.driver || '');
    self.truck = ko.observable(item.truck || '');

    self.invoice_no = item.invoice_no;
    self.invoicedate = item.invoicedate ? (new Date(item.invoicedate)).toLocaleDateString() : '';
    self.paid = ko.observable(item.paid);
    self.check_no = ko.observable(item.check_no || '');

    var d = self.shipmentdate;
    self.date = d.getFullYear() + ' / ' + (d.getMonth() + 1) + ' / ' + d.getDate();
    self.countUnit = self.SKU == '槽車' ? self.UM : self.SKU;

    self.selected = ko.observable(false);
    self.checked = ko.observable(item.checked || false);

    self.totalUnits = (function () {
        var val = parseInt(self.qty) * self.units;
        if (!isNaN(val)) {
            return val.toString() + ' ' + self.UM;
        } else {
            return '0 ' + self.UM;
        }
    })();

    var calc_value = function () {
        var val = self.price * self.qty;
        if (self.unitpriced) {
            return Math.round(val * self.units);
        } else {
            return Math.round(val);
        }
    };

    // Value is pre-tax total
    self.value = calc_value();

    self.value_ko = ko.observable(self.value);

    self.calc_string = ko.observable();

    ko.computed(function () {
        var val = self.price_ko() * self.qty_ko();
        self.calc_string("$" + self.price_ko() + " * " + self.qty_ko());
        if (self.unitpriced) {
            self.value_ko(Math.round(val * self.units));
            self.calc_string(self.calc_string() + " * " + self.units);
        } else {
            self.value_ko(Math.round(val));
        }
        self.value = self.value_ko();

        self.calc_string(self.calc_string() + " = $" + self.value_ko());
        self.calc_string(self.calc_string() + " ($" + Math.round(self.value_ko() * 1.05) + ")");
    });

    self.old_driver = item.driver || '';
    // Capture driver before change
    self.driver.subscribe(function (old_val) {
        self.old_driver = old_val;
    }, this, "beforeChange");

    // Update driver in database
    ko.computed(function () {
        var shipment_id = self.shipment_id,
            driver = self.driver();

        if (self.driver() !== self.old_driver) {
            var params = {
                _csrf: _csrf,
                id: shipment_id,
                driver: driver,
                group: self.group
            };
            post('/database/update/shipmentDriver', params, function (response) {
                    alert("Driver change saved successfully.");
            });
        }
    });

    // Capture qty before change
    self.qty_ko.subscribe(function (old_val) {
        self.qty = old_val;
    }, this, "beforeChange");

    // Update qty in database
    ko.computed(function (old_val) {
        var shipmentitem_id = self.shipmentitem_id,
            qty = self.qty_ko();

        if (self.qty !== self.qty_ko() && !isNaN(parseInt(self.qty_ko()))) {
            var params = {
                _csrf: _csrf,
                id: shipmentitem_id,
                qty: qty
            };
            post('/database/update/shipmentItemQty', params, function (response) {
                alert("Quantity change saved successfully.");
            });
        }
    });

    // Capture qty before change
    self.price_ko.subscribe(function (old_val) {
        self.price = old_val;
    }, this, "beforeChange");

    // Update qty in database
    ko.computed(function (old_val) {
        var order_id = self.order_id,
            price = self.price_ko();

        if (self.price !== self.price_ko() && !isNaN(parseFloat(self.price_ko()))) {
            var params = {
                _csrf: _csrf,
                id: order_id,
                price: price
            };
            post('/database/update/orderPrice', params, function (response) {
                alert("Price change saved successfully.");
                self.price = self.price_ko();
            });
        }
    });

    // Update check number in database
    ko.computed(function (old_val) {
        var invoice_id = self.invoice_id,
            check_no = self.check_no();

        if (invoice_id && typeof _csrf !== "undefined") {
            var params = {
                _csrf: _csrf,
                id: invoice_id,
                check_no: check_no
            };
            post('/database/update/check_no', params, function (response) {
//                alert("Check number change saved successfully.");
                self.paid(response.check_no != '' ? true : false);

            });
        }
    });
}

function KO_Invoice(item) {

}


toInputDate = function (datestr) {
    if (typeof datestr == 'undefined') return undefined;
    if (datestr === null) return undefined;
    if (datestr === undefined) return undefined;

    var d = new Date(datestr);
    if (d == "Invalid Date") return undefined;
    newDateStr = [
        d.getFullYear(),
        [d.getMonth()<9?'0':'', d.getMonth()+1].join(''),
        [d.getDate()<10?'0':'', d.getDate()].join('')
    ].join('-');
    return newDateStr;
}
