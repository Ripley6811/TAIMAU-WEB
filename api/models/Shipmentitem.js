/**
 * Shipmentitem.js
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
        shipment_id: {
            model: 'shipment',
            required: true
        },
        qty: {
            type: 'integer',
            required: true
        },
        lot: {
            type: 'string',
            defaultsTo: ''
        },
        duedate: {
            type: 'date',
            required: false,
            defaultsTo: null
        },
        shipped: {
            type: 'boolean',
            defaultsTo: true
        }
      ,
      duedate_string: function () {
          if (this.duedate === null) {
              return '';
          } else {
              return this.duedate.getFullYear() + 
                  ' / ' + (this.duedate.getMonth()+1) +
                  ' / ' + this.duedate.getDate();
          }
      }

    }
};