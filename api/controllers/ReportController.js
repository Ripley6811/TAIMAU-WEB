/**
 * ReportController
 *
 * @description :: Server-side logic for managing reports
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    'index': function (req, res) {
        Cogroup.findOne(req.param('id'))
        .populate('branches')
        .exec(function (err, cogroup) {
            if (err) {
                res.json({error: err.message}, 400);
                return
            }

            res.view({ cogroup: cogroup });
        });
    }
};

