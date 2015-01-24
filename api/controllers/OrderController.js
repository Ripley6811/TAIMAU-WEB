/**
 * OrderController
 *
 * @description :: Server-side logic for managing orders
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	
    // Sort and show all orders arranged by due date.
    due: function (req, res) {
        var page = req.param('id');
        if (page === undefined || page < 1) page = 1;
        
        Order.find()
        .where({is_open: true, duedate: {'!': null}})
        .paginate({page: page, limit: 16})
        .sort('duedate DESC')
        .populate('MPN')
        .populate('shipments')
        .exec(function (err, orders) {
            if (err) res.json({
                error: err.message
            }, 400);

            res.view({ 
                orders: orders,
                page: Number(page),
                today: new Date()
            });
        });
    },
};

