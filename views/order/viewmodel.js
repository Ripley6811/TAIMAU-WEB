"use strict";

var orderdata = <%- JSON.stringify(orders) %>;  // Kept separate because it messes up formatting

/**
 * @namespace
 */
viewModel.OrdersVM = {
    init: function () {
        this.orders = ko.mapping.fromJS(orderdata);
        this.selectedRows = [];
        for (var i=0; i<orderdata.length; i++) {
            this.selectedRows.push(ko.observable(false));
        }
    },
    rowClick: function (event, index) {
        if (event.ctrlKey) {
            console.log(event);
            this.selectedRows[index](!this.selectedRows[index]());
        }
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

var dblclick = function () {
    console.log("DOUBLE CLICK");
}

/**
 * Activate the use of Bootstrap dropdowns on page.
 */
$(function () {
    $('[data-toggle="dropdown"]').dropdown()
})
