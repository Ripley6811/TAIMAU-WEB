/**
* Invoice.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

    schema: true,
//    autoPK: false,
    autoCreatedAt: false,
    autoUpdatedAt: false,
    attributes: {
    items: {
        collection: 'invoiceitem',
        via: 'invoice_id'
    },
    invoicedate: {
        type: 'date',
        required: true
    },
    invoice_no: {
        type: 'string',
        defaultsTo: ''
    },
    check_no: {
        type: 'string',
        defaultsTo: ''
    },
    invoicenote: {
        type: 'string',
        defaultsTo: ''
    },
    seller: {
        model: 'branch',
        required: true
    },
    buyer: {
        model: 'branch',
        required: true
    },
    paid: {
        type: 'boolean',
        defaultsTo: false
    },
    paydate: {
        type: 'date'
    },

    invoicedate_string: function () {
        if (this.invoicedate === null) {
          return '';
        } else {
            return this.invoicedate.getFullYear() + 
                ' / ' + (this.invoicedate.getMonth()+1) +
                ' / ' + this.invoicedate.getDate();
        }
    }
    }
};

