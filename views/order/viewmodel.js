"use strict";

var orderdata = <%- JSON.stringify(orders) %>;  // Kept separate because it messes up formatting

/**
 * @namespace
 */
viewModel.OrdersVM = {
    init: function () {
        this.orders = ko.mapping.fromJS(orderdata);
        this.selectedRows = [];
        this.editingRows = [];
        for (var i=0; i<orderdata.length; i++) {
            this.selectedRows.push(ko.observable(false));
            this.editingRows.push(ko.observable(false));
        }
    },

    rowClick: function (event, index) {
        if (event.ctrlKey) {
            console.log(event);
            this.selectedRows[index](!this.selectedRows[index]());
        }
    },

    editButton: function (index, data) {
        this.editingRows[index](true);
    },

    editSaveButton: function (el, index) {
        // Traverse up to row (TR) element
        while (el.tagName !== 'TR') {
            el = el.parentElement;
        }

        // Get list of cell (TD) elements
        var td_list = el.children,
            updates = {};
        // Look for "input" tags and get values
        for (var i=0; i<td_list.length; i++) {
            if (td_list[i].getAttribute("input") === "orderdate") {
                var value = new Date(td_list[i].children[1].value);
                if (!isNaN(value.getDate()))
                    updates["orderdate"] = value;
            }
            if (td_list[i].getAttribute("input") === "orderID") {
                var value = td_list[i].children[1].value;
                updates["orderID"] = value;
            }
            if (td_list[i].getAttribute("input") === "qty") {
                var value = parseInt(td_list[i].children[1].value);
                if (!isNaN(value))
                    updates["qty"] = value;
            }
            if (td_list[i].getAttribute("input") === "price") {
                var value = parseFloat(td_list[i].children[1].value);
                if (!isNaN(value))
                    updates["price"] = value;
            }
            if (td_list[i].getAttribute("input") === "applytax") {
                var value = td_list[i].children[1].checked;
                updates["applytax"] = value;
            }
            if (td_list[i].getAttribute("input") === "ordernote") {
                var value = td_list[i].children[1].value;
                updates["ordernote"] = value;
            }
        }
//        this.editingRows[index](false);
        this.updateRecord(index, updates);
    },

    editCancelButton: function (index) {
        this.editingRows[index](false);
    },

    updateRecord: function (index, updates) {
        var ko_rec = this.orders()[index],
            params = {
                id: ko_rec.id(),
                updates: updates,
                _csrf: viewModel._csrf,
            };
        console.log('params', params);
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState !== 4) return;

            var data = JSON.parse(xmlhttp.response);
            console.log(data);
            // Update view if successful
            for (var property in updates) {
                ko_rec[property](data[property]);
            }
        };
        xmlhttp.open('PUT', '/order/update', true);
        xmlhttp.setRequestHeader('Content-type', 'application/json');
        xmlhttp.send(ko.toJSON(params));
    },

    deleteRecord: function () {
        console.log('DELETE NOT IMPLEMENTED')
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
 * Activate the use of Bootstrap dropdowns on page.
 */
$(function () {
    $('[data-toggle="dropdown"]').dropdown()
})
