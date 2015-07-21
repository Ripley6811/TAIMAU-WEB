/**
 * CostflowController
 *
 * @description :: Server-side logic for managing analyses
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

    'index': function (req, res) {
        if (req.method === 'POST') {
            var costflow_vals = req.param('costflow'),
                material_list = req.param('materials');

            Costflow.create(costflow_vals, function (err, rec) {
                if (err) res.send(err);

                material_list.forEach(function (each) {
                    each.costflow = rec.id;
                });
                Costflowraw.create(material_list, function (err, recs) {
                    if (err) res.send(err);

                    Costflow.findOne(rec.id)
                    .populate('materials')
                    .exec(function (err, rec2) {
                        res.send(rec2);
                    });

                });
            });

        }  // End of 'POST'
        if (req.method === 'GET') {
            Costflow.find()
            .populate('materials')
            .exec(function (err, recs) {
                res.send(recs);
            });
        }  // End of 'GET'
        if (req.method === 'DELETE') {
            console.log('DELETE request:', req.param('id'));
            Costflowraw.find()
                .where({costflow: req.param('id')})
                .exec(function (err, recs) {
                    recs.forEach(function (rec) {
                        rec.destroy();
                    });
                    Costflow.findOne(req.param('id')).exec(function (err, rec) {
                        rec.destroy();
                        res.send(rec);
                    });

                });
        }  // End of 'DELETE'
    }
};
