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
            console.log(evt.keyCode, evt);
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
                    console.log("Multiple ship modal not implemented")
                    return false;
                }
                // Opens help window if none is selected.
                if (nSelected > 0) {
                    $('#createShipmentModal').modal('show');
                } else {
                    $('#helpModal').modal('show');
                }
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
     * Sorts the products array with discontinued ones at bottom.
     */
    sortDiscontinued: function () {
        this.products.sort(function (a, b) {
            var p = 'discontinued';
            return a[p]() === b[p]() ? 0 : (a[p]() < b[p]() ? -1 : 1);
        });
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

        if (newRec.inventory_name.length < 3) {
            ko_rec.errorMessage('品名太短');
            return false;
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
        // Activate year & other tooltips (opt-in function).
        $('[data-toggle="tooltip"]').tooltip();
        // Scroll page to top.
        window.scrollTo(0, 0);
        return newRec;
    },

    /**
     * Create a new record with default values and add to array.
     */
    createNewRecord: function () {
        var ko_rec = this.createFromTemplate();
        ko_rec.qtyRequested(0);
        ko_rec.UM('kg');
        ko_rec.SKU('桶');
        ko_rec.SKUlong('');
        ko_rec.curr_price(0);
        ko_rec.unitpriced(true);
        ko_rec.units(1);
        ko_rec.note('');
        ko_rec.inventory_name('');
        ko_rec.product_label('');
        ko_rec.english_name('');
        ko_rec.ASE_PN('');
        ko_rec.ASE_RT('');
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

            self.sortDiscontinued();
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
