/**
 * Invoiceitem.js
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
        order_id: {
            model: 'order',
            required: true
        },
        invoice_id: {
            model: 'invoice',
            required: true
        },
        shipmentitem_id: {
            model: 'shipmentitem',
            required: true
        },
        qty: {
            type: 'integer',
            required: true
        }

    }
};