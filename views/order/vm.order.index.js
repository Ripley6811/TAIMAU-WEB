"use strict";

var keyCode = {
    ENTER: 13,
    F1: 112,
    N: 78
}

/**
 * @namespace
 */
viewModel.OrderIndex = {
    /**
     * KO Array holding 'Order' records using 'model.Order' model.
     */
    orders: ko.observableArray(),
    /**
     * KO Array holding 'Product' records using ko.mapping.
     */
    products: ko.observableArray(),
    /**
     * Boolean to show/hide loading message on page.
     */
    isLoading: ko.observable(true),
    /**Integer for next page or Order records to load from database.
     */
    ordersPage: 1,
    /**
     * Boolean to designate a new shipment as purchase or sale.
     */
    isPurchase: ko.observable(null),
    /**
     * String for a new shipment/manifest number.
     */
    shipment_no: ko.observable(),
    /**
     * Creates the Orders KO Array and adds extra observables.
     */
    init: function () {
        var self = this;

        // Add keypress options to page
        document.onkeydown = function(evt) {
            switch(evt.keyCode) {
            // ENTER: Creates shipment from selected items.
            case keyCode.ENTER:
                var orders = self.orders(),
                    noneSelected = true;
                for (var i=0; i<orders.length; i++) {
                    if (orders[i].isSelected()) {
                        noneSelected = false;
                        self.isPurchase(orders[i].is_purchase());
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

        // Adds window listener to load more records when scroll hits bottom.
        var $win = $(window),
            $doc = $(document);
        $win.scroll(function () {
            if ($win.height() + $win.scrollTop()
                        == $doc.height()) {
                // Display loading message.
                self.isLoading(true);
                self.retrieveOrderRecords();
            }
        });

        // Load list of products into ko array.
        self.loadProducts();
        // Load first page of records into ko array.
        self.retrieveOrderRecords();
        self.sortOrderDate();
    },

    /**
     * Retrieves a page of records from database and adds to Orders array.
     */
    retrieveOrderRecords : function () {
        var self = this,
            callback = function (orderdata) {
                self.ordersPage += 1;
                orderdata.forEach(function (order) {
                    self.orders.push(models.Order(order));
                })
                // Activate year & other tooltips (opt-in function).
                $('[data-toggle="tooltip"]').tooltip();
                self.isLoading(false);
            },
            params = {
                _csrf: '<%= _csrf %>',
                co: '<%= res.locals.cogroup ? cogroup.name : "" %>',
                page: self.ordersPage
            },
            xhr = new XMLHttpRequest();

        xhr.open('POST', '/order/page', true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;
            if (!xhr.response) {
                alert("Response is empty");
                return;
            }

            var res = JSON.parse(xhr.response);
            callback(res.orders);
        };
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.send(ko.toJSON(params));
    },

    /**
     * Sorts orders by date with newest at top.
     */
    sortOrderDate: function () {
        this.orders.sort(function (a, b) {
            var p = 'orderdate';
            return b[p]() === a[p]() ? 0 : (b[p]() < a[p]() ? -1 : 1);
        });
    },

    /**
     * Sorts the orders array by order number. Blanks at bottom.
     */
    sortOrderID: function () {
        this.orders.sort(function (a, b) {
            var p = 'orderID',
                a = a[p]() ? a[p]().toUpperCase() : 'zzz',
                b = b[p]() ? b[p]().toUpperCase() : 'zzz';
            return a === b ? 0 : (a < b ? -1 : 1);
        });
    },

    /**
     * Sorts the orders array with open/active ones at top.
     */
    sortOrderOpen: function () {
        this.orders.sort(function (a, b) {
            var p = 'is_open';
            return a[p]() === b[p]() ? 0 : (a[p]() > b[p]() ? -1 : 1);
        });
    },

    /**
     * Adds or removes highlighting to a table row.
     * @param {Object} event Event object for click.
     * @param {Number} index Index of record in Orders KO Array.
     */
    rowClick: function (event, index) {
        if (event.ctrlKey) {
            switch(event.altKey) {
            case true:
                this.toggleOpen(index);
                break;
            case false:
                this.toggleSelection(index);
                break;
            }
        }
    },

    /**
     * Adds or removes highlighting to a table row.
     * @param {Object} event Event object for click.
     * @param {Number} index Index of record in Orders KO Array.
     */
    toggleSelection: function (index) {
        var ko_rec = this.orders()[index];
        ko_rec.isSelected(!ko_rec.isSelected());
    },

    /**
     * Saves new values to an object and passes it to update or create function.
     * @param {Object} el    HTML button element calling this function.
     * @param {Number} index Index of record in Orders KO Array.
     */
    editSaveButton: function (el, index) {
        var ko_rec = this.orders()[index];
        // Traverse up to row (TR) element
        while (el.tagName !== 'TR') {
            el = el.parentElement;
        }

        // Get list of cell (TD) elements
        var td_list = el.children,
            updates = {};
        // Look for "has-input" tags and get values
        for (var i=0; i<td_list.length; i++) {
            var inputType = td_list[i].getAttribute("has-input"),
                inputChild = td_list[i].children[1];
//            console.log(inputType, inputChild);
            // Convert and validate value type
            if (inputType === "orderdate") {
                var value = new Date(inputChild.value);
                if (!isNaN(value.getDate()))
                    updates["orderdate"] = value;
            } else if (inputType === "orderID") {
                var value = inputChild.value;
                updates["orderID"] = value;
            } else if (inputType === "qty") {
                var value = parseInt(inputChild.value);
                if (!isNaN(value))
                    updates["qty"] = value;
            } else if (inputType === "price") {
                var value = parseFloat(inputChild.value);
                if (!isNaN(value))
                    updates["price"] = value;
            } else if (inputType === "applytax") {
                var value = inputChild.checked;
                updates["applytax"] = value;
            } else if (inputType === "ordernote") {
                var value = inputChild.value;
                updates["ordernote"] = value;
            } else if (inputType === "MPN" && !ko_rec.id()) {
                var value = inputChild.value;
                if (value) {
                    updates["MPN"] = value;
                }
            } else if (inputType === "seller-buyer") {
                var valueSeller = inputChild.children[0].value;
                var valueBuyer = inputChild.children[1].value;
                if (valueSeller) {
                    updates["seller"] = valueSeller;
                }
                if (valueBuyer) {
                    updates["buyer"] = valueBuyer;
                }
            }
        }

        if (ko_rec.id()) {
            this.updateRecord(ko_rec, updates);
        } else {
            this.createRecord(ko_rec, updates);
        }
    },

    /**
     * Turns on editing mode for record.
     * @param {Number} index Index of record in the Orders KO Array.
     */
    editButton: function (index) {
        this.orders()[index].isEditing(true);
    },

    /**
     * Turns off editing mode for particular record in Orders KO Array.
     * @param {Number} index Index of record in the Orders KO Array.
     */
    editCancelButton: function (index) {
        var order = this.orders()[index];
        if (order.id()) {
            order.isEditing(false);
        } else {
            // Remove if not saved (no DB id).
            this.orders.remove(order);
        }
    },

    /**
     * Updates the Order record in database.
     * @param {Object} ko_rec  Record in the Orders KO Array.
     * @param {Object} updates Key-values pairs for properties to update.
     */
    updateRecord: function (ko_rec, updates) {
        var params = {
                id: ko_rec.id(),
                updates: updates,
                _csrf: viewModel._csrf,
            };

        var xhr = new XMLHttpRequest();
        xhr.open('PUT', '/order/update', true);
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
        var newRec = ko.toJS(ko_rec);
        // Delete the null ID.
        delete newRec.id;
        // Change product object to product ID, whether updates includes MPN or not.
        newRec.MPN = newRec.MPN.MPN;
        // Update properties from inputs
        for (var prop in updates) {
            newRec[prop] = updates[prop];
        }

        var params = {
                data: newRec,
                _csrf: viewModel._csrf,
            };

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/order/createOne', true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;

            var data = JSON.parse(xhr.response);
            // Update view if successful
            console.log(data);
            console.log(ko.toJS(ko_rec));
            ko.mapping.fromJS(data, ko_rec);
//            ko.mapping.fromJS(data.MPN, ko_rec.MPN);
        };
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.send(ko.toJSON(params));
    },

    /**
     * Deletes an Order record from the database.
     * @param   {Object}  ko_rec A KO mapped record object.
     * @returns {Boolean} Deletion succeeded or not.
     */
    deleteRecord: function (ko_rec) {
        var orders_KOA = this.orders,
            params = {
                id: ko_rec.id(),
                _csrf: viewModel._csrf,
            };

        var xhr = new XMLHttpRequest();
        xhr.open('DELETE', '/order/delete', true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;

            // Remove record from array if successful
            if (xhr.status === 204) {
                orders_KOA.remove(ko_rec);
                return true;
            }
            // Display error
            var data = JSON.parse(xhr.response);
            if (data.error && data.raw.code === 'ER_ROW_IS_REFERENCED_2') {
                ko_rec.errorMessage("不能刪除 - 訂單已經出貨.");
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
        var self = this;
        if (self.isPurchase() === false) {
            var xhr = new XMLHttpRequest();
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
        var newData = ko.toJS(data || this.orders()[0]);
        // Reset some attributes for new entry.
        delete newData['shipments'];
        newData['id'] = undefined;
        newData['qty_shipped'] = 0;
        newData['is_open'] = true;
        newData['orderdate'] = new Date();
        // Add entry to first position and enable editing.
        this.orders.unshift(ko.mapping.fromJS(newData));
        this.orders()[0].isEditing(true);
        this.orders()[0].isSelected(false);
        // Activate year & other tooltips (opt-in function).
        $('[data-toggle="tooltip"]').tooltip();
        // Scroll page to top.
        window.scrollTo(0, 0);
        return this.orders()[0];
    },

    /**
     * Create a new PO based, add to array and enable editing.
     */
    createNewOrder: function () {
        var ko_rec = this.createFromTemplate();
        ko_rec.qty(0);
        ko_rec.ordernote('');
    },

    /**
     * Switches the order record to open or closed (archived)
     */
    toggleOpen: function (index) {
        var order = this.orders()[index],
            updates = {is_open: !order.is_open()};
        this.updateRecord(order, updates);
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
                self.products.push(products()[i]);
            }
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
viewModel.OrderIndex.init();