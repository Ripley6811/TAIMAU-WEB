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
      }

  }
};

