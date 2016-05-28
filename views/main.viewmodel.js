"use strict";

/**
 * @fileOverview This is the main viewModel object including utility methods.
 * This should load first so that other scripts add to the "viewModel" namespace.
 * Adds the KnockoutJS viewmodel to page when document is ready.
 * Add sub-models to the `viewModel` namespace.
 */

/**
 * @namespace
 */
var viewModel = {
    /**
     * CSRF token.
     */
    _csrf: '<%= _csrf %>' !== '' ? '<%= _csrf %>' : undefined,
    
    /**
     * Current selected company name (ID) if applicable.
     */
    co_name: '<%= res.locals.cogroup %>' !== '' ? '<%= cogroup.name %>' : undefined,

    /**
     * Convert date string to "YYYY - M月 D日" format.
     * @param   {String} datestr ISO date string
     * @returns {String} Formatted date string
     */
    formatDate: function (datestr) {
        var date = new Date(datestr),
            outstr = '';

        outstr += date.getMonth()+1 < 10 ? ' ' : '';
        outstr += date.getMonth()+1 + '月 ';
        outstr += date.getDate() < 10 ? ' ' : '';
        outstr += date.getDate() + '日';

        return outstr;
    },
};

/**
 * Binds Knockout model to html "body" when document is ready.
 */
$(document).ready(function() {
    ko.applyBindings(viewModel, document.getElementById('body'));
});