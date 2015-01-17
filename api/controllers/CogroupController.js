/**
 * CogroupController
 *
 * @description :: Server-side logic for managing cogroups
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	
    'new': function (req, res) {
        res.view();
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

