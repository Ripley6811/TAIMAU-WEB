/**
 * CogroupController
 *
 * @description :: Server-side logic for managing cogroups
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    

    'index': function (req, res) {
        var findParams = { sort: 'name' };
        var id = req.param('id');
        if (id == 'suppliers') {
            findParams.where = { is_supplier: true };
        }
        if (id == 'customers') {
            findParams.where = { is_customer: true };
        }
        Cogroup.find(findParams)
            .populate('branches')
            .exec(function (err, cogroups) {
                if (err) res.json({
                    error: err.message
                }, 400);

                res.view({ cogroups: cogroups });
            });
    },
	
    'new': function (req, res) {
        res.view();
    },
	
    show: function (req, res) {
        Cogroup.findOne(req.param('id'))
            .populate('branches')
            .populate('contacts')
            .exec(function (err, cogroup) {
                if (err) res.json({
                    error: err.message
                }, 400);

                res.view({ cogroup: cogroup });
            });
    },
    
    create: function (req, res, next) {
//        Cogroup.create(req.params.all(), function cogroupCreated(err, cogroup) {
//            if (err) return next(err);
//    
//            res.json(cogroup);
//        });
        
        console.log(req.params.all());
        res.json(req.params.all());
    }
};

