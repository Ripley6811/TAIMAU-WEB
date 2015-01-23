/**
* Order.js
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
      MPN: {
          model: 'product',
          required: true
      },
      orderdate: {
          type: 'date'
      },
      duedate: {
          type: 'date'
      },
      group: {
          model: 'cogroup',
          required: true
      },
      seller: {
          model: 'branch',
          required: true
      },
      buyer: {
          model: 'branch',
          required: true
      },
      qty: {
          type: 'integer',
          required: true
      },
      
      shipments: {
            collection: 'shipmentitem',
          via: 'order_id'
      },
    
      qty_shipped: function () {
//          console.log(this.shipments.length);
            var total = 0;
            for (var i = 0; i < this.shipments.length; i = i +1) {
//                console.log(shipment);
//                console.log(this.qty);
                total += Number(this.shipments[i].qty);
            }
            return total;
        }
  }
};

