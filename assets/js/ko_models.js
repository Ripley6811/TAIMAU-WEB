
function KO_Cogroup(data) {
    var self = this,
        data = data || {};
    
    self.name = ko.observable(data.name); // ID - Primary Key
    self.is_active = ko.observable(data.is_active);
    self.is_supplier = ko.observable(data.is_supplier);
    self.is_customer = ko.observable(data.is_customer);
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
    self.units = ko.observable(data.units || '');
    self.UM = ko.observable(data.UM || '');
    self.SKU = ko.observable(data.SKU || '');
    self.SKUlong = ko.observable(data.SKUlong || '');
    self.note = ko.observable(data.note || '');
    self.ASE_PN = ko.observable(data.ASE_PN || '');
    self.ASE_RT = ko.observable(data.ASE_RT || '');
    self.curr_price = ko.observable(data.curr_price || '');
    self.unitpriced = ko.observable(data.unitpriced === undefined ? true : data.unitpriced);
    self.unitcounted = ko.observable(data.unitcounted === undefined ? true : data.unitcounted);
    self.is_supply = ko.observable(data.is_supply === undefined ? false : data.is_supply);
    self.discontinued = ko.observable(data.discontinued === undefined ? false : data.discontinued);
    self.json = ko.observable(data.json || {});
    
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
        // Activate the save button.
        self.saved(false);
    });
    
    self.saved(true);
}