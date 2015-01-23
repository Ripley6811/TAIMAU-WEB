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
      }
      
  }
};

