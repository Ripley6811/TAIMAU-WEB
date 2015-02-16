
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
    
    self.needToSave = ko.computed(function () {
        // Listen for changes to the following.
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
    self.fax = ko.observable(data.fax || '');
    self.email = ko.observable(data.email || '');
    self.note = ko.observable(data.note || '');
    
    self.saved = ko.observable(true); // Set to false if any editing is done.
    
    self.needToSave = ko.computed(function () {
        // Listen for changes to the following.
        self.branch();
        self.name();
        self.position();
        self.phone();
        self.fax();
        self.email();
        self.note();
        // Activate the save button.
        self.saved(false);
    });
    
    self.saved(true);
}

function KO_Product(data) {
    var self = this,
        data = data || {};
    
    self.MPN = ko.observable(data.MPN || null); // ID - Primary Key
    self.group = ko.observable(data.group || null);
    self.product_label = ko.observable(data.product_label || '');
    self.inventory_name = ko.observable(data.inventory_name || '');
    self.english_name = ko.observable(data.english_name || '');
    self.units = ko.observable(data.units || 0.0).extend({ numeric: 3 });
    self.UM = ko.observable(data.UM || '');
    self.SKU = ko.observable(data.SKU || '');
    self.SKUlong = ko.observable(data.SKUlong || '');
    self.note = ko.observable(data.note || '');
    self.ASE_PN = ko.observable(data.ASE_PN || '');
    self.ASE_RT = ko.observable(data.ASE_RT || '');
    self.curr_price = ko.observable(data.curr_price || 0.0);
    self.unitpriced = ko.observable(data.unitpriced === undefined ? true : data.unitpriced);
    self.unitcounted = ko.observable(data.unitcounted === undefined ? true : data.unitcounted);
    self.is_supply = ko.observable(data.is_supply === undefined ? false : data.is_supply);
    self.discontinued = ko.observable(data.discontinued === undefined ? false : data.discontinued);
    self.json = ko.observable(data.json || {});
    
    self.pricing = self.unitpriced() ? '/ ' + self.UM() : '/ ' + self.SKU();
    
    self.locked = ko.observable(true); // Set to true for new entries only.
    self.saved = ko.observable(true); // Set to false if any editing is done.
    
    self.needToSave = ko.computed(function () {
        // Listen for changes to the following.
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
            return '<font color="red"><span class="glyphicon glyphicon-ban-circle"></span></font>';
        } else {
            return '<font color="green"><span class="glyphicon glyphicon-ok"></span></font>';
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
    self.MPN = product.MPN;
    self.is_supply = product.is_supply;
    self.label = product.product_label ? product.product_label : product.inventory_name;
    self.inventory_name = product.inventory_name;
    self.sku = product.SKU;
    self.guige = product.SKU;
    self.qty = ko.observable(order.qty ? order.qty : '');
    self.price = ko.observable(product.curr_price);
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
    
    self.selected = ko.observable(false);
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
        data = data || {};
    
    self.id = data.id;
    self.order_id = data.order_id;
    self.shipment = data.shipment_id;
    self.shipment_no = ko.observable(self.shipment ? self.shipment.shipment_no : undefined);
    
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

    
getProducts = function (params, callback) {
    getTemplate('/product/get', params, function (res_records) {
        // Sort by rank value.
        res_records.sort(function (a, b) {
            return a.json.rank - b.json.rank;
        });
        callback(res_records);
    });
};

getOrders = function (params, callback) {
    getTemplate('/order/getOpen', params, function (res_records) {
        // Sort by rank value.
        res_records.sort(function (a, b) {
            return a.MPN.json.rank - b.MPN.json.rank;
        });
        callback(res_records);
    });
};

getShipments = function (params, callback) {
    getTemplate('/database/get/shipments', params, function (res_records) {
        // Sort by rank value.
        res_records.sort(function (a, b) {
            return b.shipmentdate - a.shipmentdate;
        });
        callback(res_records);
    });
};

getShipmentitems = function (params, callback) {
    getTemplate('/database/get/shipmentitems', params, function (res_records) {
        // Sort by rank value.
        res_records.sort(function (a, b) {
            return b.shipment_id.shipmentdate - a.shipment_id.shipmentdate;
        });
        callback(res_records);
    });
};

getTemplate = function (url, params, callback) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState !== 4) return;
        var db_records = JSON.parse(xmlhttp.response);
        callback(db_records);
    };
    xmlhttp.open('POST', url, true);
    xmlhttp.setRequestHeader('Content-type', 'application/json');
    xmlhttp.send(ko.toJSON(params));
};

post = function (url, params, callback) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState !== 4) return;
        console.log('POST RESPONSE', xmlhttp.response);
        callback(JSON.parse(xmlhttp.response));
    };
    xmlhttp.open('POST', url, true);
    xmlhttp.setRequestHeader('Content-type', 'application/json');
    xmlhttp.send(ko.toJSON(params));
};

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