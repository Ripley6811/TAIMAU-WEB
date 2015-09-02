/**
 * AdminController
 *
 * @description :: Server-side logic for managing admins
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    /**
     * `AdminController.branch()`
     */
    branch: function (req, res) {
        Branch.find()
//        .populateAll()
        .sort('group')
        .exec(function (err, branches) {
            if (err) res.send(err);

            res.view({
                length: branches.length,
                branches: branches
            })
        })
    },

    /**
     * `AdminController.branch()`
     */
    product: function (req, res) {
        Product.find()
//        .populateAll()
        .sort('inventory_name')
        .exec(function (err, products) {
            if (err) res.send(err);

            res.view({
                length: products.length,
                products: products
            })
        })
    }
};

