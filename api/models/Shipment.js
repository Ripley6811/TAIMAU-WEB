/**
* Shipment.js
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
          collection: 'shipmentitem',
          via: 'shipment_id'
      },
      shipmentdate: {
          type: 'date',
          required: true
      },
      shipment_no: {
          type: 'string',
          defaultsTo: ''
      }
      
      ,
      shipmentdate_string: function () {
          if (this.shipmentdate === null) {
              return '';
          } else {
              return this.shipmentdate.getFullYear() + 
                  ' / ' + (this.shipmentdate.getMonth()+1) +
                  ' / ' + this.shipmentdate.getDate();
          }
      }
  }
};

