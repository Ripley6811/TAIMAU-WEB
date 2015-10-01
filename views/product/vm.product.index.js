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
//
        document.onkeydown = function(evt) {
            switch(evt.keyCode) {
            // ENTER: Creates shipment from selected items.
            case keyCode.ENTER:
                var products = self.products(),
                    noneSelected = true;
                for (var i=0; i<products.length; i++) {
                    if (products[i].isSelected()) {
                        noneSelected = false;
                        self.isPurchase(products[i].is_supply());
                    }
                }
                // Opens help window if none is selected.
                if (noneSelected) {
                    $('#helpModal').modal('show');
                } else {
                    $('#createShipmentModal').modal('show');
                }
                return false;
            // F1: Shows help modal showing hotkeys.
            case keyCode.F1:
                $('#helpModal').modal('show');
                return false;
            // N+Alt: Creates a new record row at top.
            case keyCode.N:
                if (evt.altKey) {
                    self.createNewOrder();
                }
                return false;
            }
        };
    },

    /**
     * Sorts the orders array by order number. Blanks at bottom.
     */
    sortOrderID: function () {
//        this.orders.sort(function (a, b) {
//            var p = 'orderID',
//                a = a[p]() ? a[p]().toUpperCase() : 'zzz',
//                b = b[p]() ? b[p]().toUpperCase() : 'zzz';
//            return a === b ? 0 : (a < b ? -1 : 1);
//        });
    },

    /**
     * Sorts the orders array with open/active ones at top.
     */
    sortOrderOpen: function () {
//        this.orders.sort(function (a, b) {
//            var p = 'is_open';
//            return a[p]() === b[p]() ? 0 : (a[p]() > b[p]() ? -1 : 1);
//        });
    },

    /**
     * Adds or removes highlighting to a table row.
     * @param {Object} event Event object for click.
     * @param {Number} index Index of record in Orders KO Array.
     */
    rowClick: function (event, index) {
        if (event.ctrlKey && event.altKey) {
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
                curr_price: undefined,
                UM: undefined,
                SKU: undefined,
            };

        for (var field in updates) {
            updates[field] = ko_rec[field]();
        }

        console.log(updates);

        if (ko_rec.MPN()) {
            this.updateRecord(ko_rec, updates);
        } else {
            this.createRecord(ko_rec, updates);
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
        if (product.id()) {
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
     * Creates an Order record in database.
     * @param {Object} ko_rec  Record in the Orders KO Array.
     * @param {Object} updates Key-values pairs for properties to update.
     */
    createRecord: function (ko_rec, updates) {
//        var newRec = ko.toJS(ko_rec);
//        // Delete the null ID.
//        delete newRec.id;
//        // Change product object to product ID
//        newRec.MPN = newRec.MPN.MPN;
//        // Update properties from inputs
//        for (var prop in updates) {
//            newRec[prop] = updates[prop];
//        }
//
//        var params = {
//                data: newRec,
//                _csrf: viewModel._csrf,
//            };
//
//        var xmlhttp = new XMLHttpRequest();
//        xmlhttp.onreadystatechange = function () {
//            if (xmlhttp.readyState !== 4) return;
//
//            var data = JSON.parse(xmlhttp.response);
//            // Update view if successful
//            ko.mapping.fromJS(data, ko_rec);
//        };
//        xmlhttp.open('POST', '/order/createOne', true);
//        xmlhttp.setRequestHeader('Content-type', 'application/json');
//        xmlhttp.send(ko.toJSON(params));
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
//        var newData = ko.toJS(data || this.orders()[0]);
//        // Reset some attributes for new entry.
//        delete newData['shipments'];
//        newData['id'] = undefined;
//        newData['qty_shipped'] = 0;
//        newData['is_open'] = true;
//        newData['orderdate'] = new Date();
//        // Add entry to first position and enable editing.
//        this.orders.unshift(ko.mapping.fromJS(newData));
//        this.orders()[0].isEditing(true);
//        this.orders()[0].isSelected(false);
//        // Activate year & other tooltips (opt-in function).
//        $('[data-toggle="tooltip"]').tooltip();
//        // Scroll page to top.
//        window.scrollTo(0, 0);
//        return this.orders()[0];
    },

    /**
     * Create a new PO based, add to array and enable editing.
     */
    createNewRecord: function () {
//        var ko_rec = this.createFromTemplate();
//        ko_rec.qty(0);
//        ko_rec.ordernote('');
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
        xhr.open('GET', '/product/get/<%= res.locals.cogroup ? cogroup.name : null %>', true);
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
