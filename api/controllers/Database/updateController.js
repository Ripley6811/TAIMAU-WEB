/**
 * Database/updateController
 *
 * @description :: Server-side logic for managing database/updates
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	


    /**
    * `Database/updateController.product()`
    */
    product: function (req, res) {
        var editRecord = req.param('product');
        
        console.log(editRecord.MPN);
        
        if (editRecord.MPN) {
            Product.update(editRecord.MPN, editRecord, function(err, rec) {
                if (err) { res.send(err); return; }

                res.send(rec);
            });
        }
    },


    /**
    * `Database/updateController.branch()`
    */
    branch: function (req, res) {
        return res.json({
            todo: 'branch() is not implemented yet!'
        });
    }
};

