"use strict";

/**
 * @namespace
 */
viewModel.ProductsVM = {
    /**
     * KO Array holding 'Product' records using 'model.Product' model.
     */
    products: ko.observableArray(),
    /**
     * Boolean to show/hide loading message on page.
     */
    isLoading: ko.observable(true),
    /**
     * Boolean to designate a new shipment as purchase or sale.
     */
    isPurchase: ko.observable(null),
    /**
     * String for a new shipment/manifest number.
     */
    shipment_no: ko.observable(),
    /**
     * Initiate data loading and adds page listeners.
     */
    init: function () {
        var self = this;
        self.loadProducts();

        document.onkeydown = function(evt) {
            switch(evt.keyCode) {
            // ENTER: Creates shipment from selected items.
            case keyCode.ENTER:
                var products = self.products(),
                    nSelected = 0;
                for (var i=0; i<products.length; i++) {
                    if (products[i].isSelected()) {
                        nSelected += 1;
                        self.isPurchase(products[i].is_supply());
                    }
                }
                // Open multiple shipment modal if +SHIFT and one item.
                if (nSelected === 1 && evt.shiftKey) {
                    $('#shipMultiModal').modal('show');
                    return false;
                }
                // Opens help window if none is selected.
                if (nSelected > 0) {
                    $('#createShipmentModal').modal('show');
                    return false;
                }

                $('#helpModal').modal('show');
                return false;
            // F1: Shows help modal showing hotkeys.
            case keyCode.F1:
                $('#helpModal').modal('show');
                return false;
            // N+Alt: Creates a new record row at top.
            case keyCode.N:
                if (evt.altKey) {
                    self.createNewRecord();
                }
                return true;  // Let bubble
            // Esc: Deselect all.
            case keyCode.ESC:
                var products = self.products();
                for (var i=0; i<products.length; i++) {
                    products[i].isSelected(false);
                }
                return true;  // Let bubble
            }
        };
    },

    /**
     * Sorts the products by PN if any with PNs at the top.
     */
    sortProducts: function () {
        this.products.sort(function (a, b) {
            var p = 'ASE_PN';
            // Discontinued products straight to bottom
            if (a['discontinued']()) return 1;
            // Empty PN strings at end of list
            if (a[p]().length < 1 && b[p]().length < 1) return 0;
            if (a[p]().length < 1 || b[p]().length < 1) return (a[p]() > b[p]() ? -1 : 1);
            // Else sort by PN
            return (a[p]() < b[p]() ? -1 : 1);
        });
    },

    /**
     * Adds or removes highlighting to a table row.
     * @param {Object} event Event object for click.
     * @param {Number} index Index of record in Orders KO Array.
     */
    rowClick: function (event, index) {
        if (event.shiftKey) {
            this.multiModalVM.setMultiShipmentProduct(ko.toJS(this.products()[index]));
            $('#shipMultiModal').modal('show');
        } else if (event.ctrlKey && event.altKey) {
            this.toggleOpen(index);
        } else if (event.ctrlKey) {
            this.toggleSelection(index);
        }
    },

    /**
     * Adds or removes highlighting to a table row.
     * @param {Object} event Event object for click.
     * @param {Number} index Index of record in Products KO Array.
     */
    toggleSelection: function (index) {
        var ko_rec = this.products()[index];
        ko_rec.isSelected(!ko_rec.isSelected());
    },

    /**
     * Saves new values to an object and passes it to update or create function.
     * @param {Object} el    HTML button element calling this function.
     * @param {Number} index Index of record in the KO Array.
     */
    editSaveButton: function (el, index) {
        var ko_rec = this.products()[index],
            updates = {
                MPN: undefined,
                product_label: undefined,
                english_name: undefined,
                is_supply: undefined,
                SKUlong: undefined,
                ASE_PN: undefined,
                ASE_RT: undefined,
                note: undefined,
                UM: undefined,
                SKU: undefined,
            };
        // If unrestricted then allow editing sensitive fields (price-related)
        // Should be restricted if POs and connected records exist.
        if (!ko_rec.restrictEditing()) {
            updates.units = undefined;
            updates.curr_price = undefined;
            updates.unitpriced = undefined;
        }
        // Copy the current data from record model
        for (var field in updates) {
            updates[field] = ko_rec[field]();
        }

        if (ko_rec.MPN()) {
            this.updateRecord(ko_rec, updates);
        } else {
            this.createRecord(ko_rec);
        }
    },

    /**
     * Turns on editing mode for record.
     * @param {Number} index Index of record in the Products KO Array.
     */
    editButton: function (index) {
        this.products()[index].isEditing(true);
    },

    /**
     * Turns off editing mode for particular record in Orders KO Array.
     * @param {Number} index Index of record in the Orders KO Array.
     */
    editCancelButton: function (index) {
        var product = this.products()[index];
        if (product.MPN()) {
            product.isEditing(false);
        } else {
            // Remove if not saved (no DB id).
            this.products.remove(product);
        }
    },

    /**
     * Updates the Product record in database.
     * @param {Object} ko_rec  Record in the Products KO Array.
     * @param {Object} updates Key-values pairs for properties to update.
     */
    updateRecord: function (ko_rec, updates) {
        var params = {
                id: ko_rec.MPN(),
                updates: updates,
                _csrf: viewModel._csrf,
            },
            xhr = new XMLHttpRequest();
        xhr.open('PUT', '/product/update', true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;

            if (xhr.status === 403) {
                alert(xhr.response);
            }

            var data = JSON.parse(xhr.response);
            // Update view if successful
            for (var property in updates) {
                ko_rec[property](data[property]);
            }
            // This does not work. Why?
//            ko.mapping.fromJS(data, ko_rec);
        };
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.send(ko.toJSON(params));
    },

    /**
     * Creates a new record in database.
     * @param {Object} ko_rec  Record in the KO Array.
     */
    createRecord: function (ko_rec) {
        var newRec = ko.toJS(ko_rec);
        // Delete the null ID.
        delete newRec.id;
        delete newRec.MPN;

        if (newRec.inventory_name.length < 2) {
            ko_rec.errorMessage('品名太短');
            return false;
        } else {
            ko_rec.errorMessage('');
        }

        var params = {
                data: newRec,
                _csrf: viewModel._csrf,
            },
            xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;

            var data = JSON.parse(xhr.response);
            // Update view if successful
            ko.mapping.fromJS(data, ko_rec);
        };
        xhr.open('POST', '/product/createOne', true);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.send(ko.toJSON(params));
    },

    /**
     * Deletes a record from the database.
     * @param   {Object}  ko_rec A KO mapped record object.
     * @returns {Boolean} Deletion succeeded or not.
     */
    deleteRecord: function (ko_rec) {
        var products_KOA = this.products,
            params = {
                MPN: ko_rec.MPN(),
                co_name: ko_rec.group(),
                _csrf: viewModel._csrf,
            },
            xhr = new XMLHttpRequest();

        xhr.open('DELETE', '/product/destroy', true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;

            // Remove record from array if successful
            if (xhr.status === 204) {
                products_KOA.remove(ko_rec);
                return true;
            }
            // Display error
            var data = JSON.parse(xhr.response);
            if (data.error && data.raw.code === 'ER_ROW_IS_REFERENCED_2') {
                ko_rec.errorMessage("不能刪除 - 已經開了訂單.");
                return false;
            }
        };
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.send(ko.toJSON(params));
    },

    /**
     * Retrieves an available shipment number from database.
     */
    computeAvailableNumber: function () {
        var self = this,
            xhr = new XMLHttpRequest();
        if (self.isPurchase() === false) {
            xhr.open('GET', '/shipment/availableNumber', true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) return;
                if (!xhr.response) {
                    alert("Response is empty");
                    return;
                }

                self.shipment_no(xhr.responseText);
            };
            xhr.send();
        } else {
            self.shipment_no('');
        }
    },

    /**
     * Create a new PO based on old PO, add to array and enable editing.
     * @param {Object} [data=this.orders()[0]] Data from old PO to copy.
     */
    createFromTemplate: function (data) {
        // Create new record model from data or use first rec in array.
        var newData = ko.toJS(data || this.products()[0]);
        // Reset some attributes for new entry.
        newData['id'] = undefined;
        newData['MPN'] = undefined;
        newData['discontinued'] = false;
        // Add entry to first position and enable editing.
        this.products.unshift(ko.mapping.fromJS(newData));
        var newRec = this.products()[0];
        newRec.isEditing(true);
        newRec.isSelected(false);
        newRec.isConfirmingDelete(false);
        newRec.errorMessage('');
        newRec.restrictEditing(false);
        // Activate tooltips (opt-in function).
        $('[data-toggle="tooltip"]').tooltip();
        // Scroll page to top.
        window.scrollTo(0, 0);
        return newRec;
    },

    /**
     * Create a new record with default values and add to array.
     */
    createNewRecord: function () {
        var ko_rec = models.Product({
            ASE_PN: '',
            ASE_RT: '',
            MPN: undefined,
            SKU: '槽車',
            SKUlong: '',
            UM: 'kg',
            curr_price: 0,
            discontinued: false,
            english_name: '',
            group: '<%= res.locals.cogroup ? cogroup.name : "" %>',
            id: undefined,
            inventory_name: '',
            is_supply: true,
            json: {},
            note: '',
            product_label: '',
            unitpriced: true,
            units: 1,
        });
        // Add entry to first position and enable editing.
        ko_rec.isEditing(true);
        ko_rec.restrictEditing(false);
        this.products.unshift(ko_rec);
        // Activate tooltips (opt-in function).
        $('[data-toggle="tooltip"]').tooltip();
        // Scroll page to top.
        window.scrollTo(0, 0);
        return ko_rec;
    },

    /**
     * Switches the product record to open or closed (discontinued)
     */
    toggleOpen: function (index) {
        var product = this.products()[index],
            updates = {discontinued: !product.discontinued()};
        this.updateRecord(product, updates);
    },

    /**
     * Request list of products for new PO creation.
     */
    loadProducts: function () {
        var self = this,
            xhr = new XMLHttpRequest();
        xhr.open('GET', '/product/get/<%= res.locals.cogroup ? cogroup.name : "all" %>', true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;

            if (!xhr.response) {
                alert("Response is empty");
                return;
            }

            var products = ko.mapping.fromJSON(xhr.response);
            for (var i=0; i<products().length; i++) {
                self.products.push(models.Product(products()[i]));
            }
            // Activate Bootstrap's tooltips (opt-in function).
            $('[data-toggle="tooltip"]').tooltip();

            self.sortProducts();
            self.isLoading(false);
        };
        xhr.send();
    },

    /**
     * Action when double-clicking on a table row.
     * @param {Number} index Row in orders array.
     */
    dblclick: function (index) {
        this.editButton(index);
    }
};
viewModel.ProductsVM.init();


viewModel.ProductsVM.multiModalVM = {
    productData: new KO_Product(),
    us: ko.observable(),
    them: ko.observable(),

    /**
     * Copy product info into modal productData variable.
     * @param {Object} product Product data object.
     */
    setMultiShipmentProduct: function(product) {
        for (var key in this.productData) {
            try {
                this.productData[key](product[key]);
            }
            catch(err) {

            }
        }
    },

    /**
     * Array of user-entered shipments data.
     */
    shipments: ko.observableArray([new KO_ShipmentItem()]),

    /**
     * Form submit function.
     */
    doSubmit: function() {
        var self = this;
        // Number of rows should be greater than 1. Last one is always incomplete.
        if (self.shipments().length == 1) {
            alert('Enter at least one quantity to submit');
            return;
        }

        var items = [];
        for (var i=0; i<self.shipments().length; i++) {
            var shipmentItem = self.shipments()[i];
            if (shipmentItem.qty() != '') {
                items.push({
                    orderID: '',
                    ordernote: '',
                    group: viewModel.co_name,
                    MPN: self.productData.MPN(),
                    is_purchase: self.productData.is_supply(),
                    is_sale: !self.productData.is_supply(),
                    seller: self.productData.is_supply() ? self.them() : self.us(),
                    buyer: self.productData.is_supply() ? self.us() : self.them(),
                    qty: shipmentItem.qty(),
                    price: self.productData.curr_price(),
                    shipmentdate: new Date(shipmentItem.shipdate().replace(/-/g, "/")),
                    orderdate: new Date(shipmentItem.shipdate().replace(/-/g, "/")),
                    shipment_no: shipmentItem.shipment_no() || '',
                    shipmentnote: shipmentItem.shipmentnote() || '',
                    is_open: false,
                });
            }
        }
        var params = {
            _csrf: viewModel._csrf,
            co_name: viewModel.co_name,
            items: items
        };
        post('/database/save/multipleshipments', params, function(res) {
            if ('error' in res) alert(res);
            else window.location = '/shipment/showall/'+viewModel.co_name;
        });
    },

    /**
     * If last line qty is filled in then add a new line for another entry.
     */
    init: function () {
        ko.computed(function() {
            if (this()[this().length - 1].qty() != '') {
                this.push(new KO_ShipmentItem());
                this()[this().length - 1].qty(); // Force listener update.
            }
        }, this.shipments);
    },
};
viewModel.ProductsVM.multiModalVM.init();
