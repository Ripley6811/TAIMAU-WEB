"use strict";

var orderdata = eval('<%- JSON.stringify(orders) %>');  // Kept separate because it messes up formatting and syntax coloring

/**
 * @namespace
 */
viewModel.OrdersVM = {
    /**
     * Creates the Orders KO Array and adds extra observables.
     */
    init: function () {
        var self = this;

        self.orders = ko.mapping.fromJS(orderdata);
        self.isPurchase = ko.observable(null);
        self.shipment_no = ko.observable();
        // Add additional observables
        for (var i=0; i<orderdata.length; i++) {
            var order = self.orders()[i],
                prod = self.orders()[i].MPN;
            order.isSelected = ko.observable(false);
            order.isEditing = ko.observable(false);
            order.isConfirmingDelete = ko.observable(false);
            order.errorMessage = ko.observable();
            order.qtyRequested = ko.observable();
            order.qtyMeasure = prod.units() === 1 ? prod.UM() : prod.SKU();
        }

        document.onkeydown = function(evt) {
            if (evt.keyCode == 13) {
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
                    self.computeAvailableNumber();
                    $('#createShipmentModal').modal('show');
                }
            }
            // Opens help window if F1 is pressed.
            if (evt.keyCode == 112) {
                $('#helpModal').modal('show');
                return false;
            }
            // Opens new PO window when Alt+N is pressed
            if (evt.keyCode == 78 && evt.altKey) {
                console.log('new po function');
                return false;
            }
        };

        self.sortOrderDate();
//        self.sortOrderOpen();
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
            this.toggleSelection(index);
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
     * Saves new values to an object and passes it to update function.
     * @param {Object} el    HTML button element calling this function.
     * @param {Number} index Index of record in Orders KO Array.
     */
    editSaveButton: function (el, index) {
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
            }
        }
//        this.orders()[index].isEditing(false);
        this.updateRecord(index, updates);
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
        this.orders()[index].isEditing(false);
    },

    /**
     * Updates the Order record in database.
     * @param {Number} index   Index of record in the Orders KO Array.
     * @param {Object} updates Key-values pairs for properties to update.
     */
    updateRecord: function (index, updates) {
        var ko_rec = this.orders()[index],
            params = {
                id: ko_rec.id(),
                updates: updates,
                _csrf: viewModel._csrf,
            };

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState !== 4) return;

            var data = JSON.parse(xmlhttp.response);
            // Update view if successful
            for (var property in updates) {
                ko_rec[property](data[property]);
            }
        };
        xmlhttp.open('PUT', '/order/update', true);
        xmlhttp.setRequestHeader('Content-type', 'application/json');
        xmlhttp.send(ko.toJSON(params));
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

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState !== 4) return;

            // Remove record from array if successful
            if (xmlhttp.status === 204) {
                orders_KOA.remove(ko_rec);
                return true;
            }
            // Display error
            var data = JSON.parse(xmlhttp.response);
            if (data.error && data.raw.code === 'ER_ROW_IS_REFERENCED_2') {
                ko_rec.errorMessage("不能刪除 - 訂單已經出貨.");
                return false;
            }
        };
        xmlhttp.open('DELETE', '/order/delete', true);
        xmlhttp.setRequestHeader('Content-type', 'application/json');
        xmlhttp.send(ko.toJSON(params));
    },

    submitClicked: function (stuff) {
        console.log('NOT IMPLEMENTED YET');
    },

    /**
     * Retrieves an available shipment number from database.
     */
    computeAvailableNumber: function () {
        console.log('this what', this);
        if (this.isPurchase() === false) {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState !== 4) return;
                console.log(xmlhttp);
                if (!xmlhttp.response) {
                    alert("Response is empty");
                    return;
                }

                this.shipment_no(xmlhttp.responseText);
            };
            xmlhttp.open('GET', '/shipment/availableNumber', true);
            xmlhttp.send();
        } else {
            this.shipment_no('');
        }
    },

    /**
     * Switches the order record to open or closed
     */
    toggleOpen: function (data, event) {
        var index = this.orders.indexOf(data),
            updates = {is_open: !data.is_open()};
        this.updateRecord(index, updates);
    },
}
viewModel.OrdersVM.init();

/**
 * Convert date string to "YYYY - M月 D日" format.
 * @param   {String} datestr ISO date string
 * @returns {String} Formatted date string
 */
viewModel.formatDate = function (datestr) {
        var date = new Date(datestr),
            outstr = '';

        outstr += date.getFullYear() + ' - ';
        outstr += date.getMonth()+1 < 10 ? ' ' : '';
        outstr += date.getMonth()+1 + '月 ';
        outstr += date.getDate() < 10 ? ' ' : '';
        outstr += date.getDate() + '日';

        return outstr;
};

/**
 * Activate the use of Bootstrap javascript on page.
 */
$(function () {
    $('[data-toggle="dropdown"]').dropdown()
    $('[data-toggle="tooltip"]').tooltip()
})
