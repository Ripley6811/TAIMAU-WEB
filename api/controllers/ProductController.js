/**
 * ProductController
 *
 * @description :: Server-side logic for managing products
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    // Sort and show all products by inventory_name.
    'index': function (req, res) {
        var id = req.param('id'),
            findParams = { sort: 'name' };
        if (id == 'suppliers') {
            findParams.where = { is_supplier: true };
        }
        if (id == 'customers') {
            findParams.where = { is_customer: true };
        }
        Cogroup.find(findParams)
        .populate('products')
        .exec(function (err, cogroups) {
            if (err) res.json({
                error: err.message
            }, 400);

            res.view({ cogroups: cogroups });
        });
    },
    // Show products for a specific company.
    show: function (req, res) {
        var id = req.param('id');
        console.log(id);
        Cogroup.findOne(id)
        .populate('products', {sort: 'inventory_name'})
        .exec(function (err, cogroup) {
            if (err) res.json({
                error: err.message
            }, 400);

            res.view({ cogroup: cogroup });
        });
    }
	
};

