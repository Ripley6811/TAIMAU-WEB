/**
 * Database/countController
 *
 * @description :: Server-side logic for managing database/counts
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	


  /**
   * `Database/countController.orders()`
   */
  orders: function (req, res) {
      var co_name = req.param('co_name');
      
      Order.count({group: co_name}, function(err, count) {
          if (err) {
              res.send(err);
          } else {
              res.send({count:count}); // Send as JSON for clarity.
          }          
      });
  },


  /**
   * `Database/countController.shipments()`
   */
  shipments: function (req, res) {
    return res.json({
      todo: 'shipments() is not implemented yet!'
    });
  },


  /**
   * `Database/countController.invoices()`
   */
  invoices: function (req, res) {
    return res.json({
      todo: 'invoices() is not implemented yet!'
    });
  }
};

