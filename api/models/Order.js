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
      is_open: {
          type: 'boolean',
          defaultsTo: true
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
                total += Number(this.shipments[i].qty);
            }
            return total;
        },
      /**
       * Return true if the requested quantity has all been shipped.
       * @returns {Boolean} True if order all shipped.
       */
      all_shipped: function () {
          return this.qty === this.qty_shipped();
      }
      ,
      duedate_string: function () {
          return this.duedate.getFullYear() + 
              ' / ' + (this.duedate.getMonth()+1) +
              ' / ' + this.duedate.getDate();
      }
      ,
      orderdate_string: function () {
          return this.orderdate.getFullYear() + 
              ' / ' + (1+this.orderdate.getMonth()) +
              ' / ' + this.orderdate.getDate();
      }
  }
};
