/**
 * BranchController
 *
 * @description :: Server-side logic for managing branches
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

    'company_list': function (req, res) {
        Branch.query('SELECT * FROM branch;', function (err, branches) {
            if (err) res.json({
                error: err.message
            }, 400);

            res.view({
                branches: branches
            });
        });
        //        res.view();
    },
    'edit': function (req, res) {
        console.log('BRANCH_EDIT', req.params.all());
        Branch.findOne(req.query.name)
            .exec(function (err, branch) {
                if (err) res.json({
                    error: err.message
                }, 400);
            
                res.view({
                    branch: branch
                });
            });
    },
    update: function (req, res, next) {
//        console.log('BRANCH_UPDATE');
        var updates = req.params.all();
        var name = updates.name;
        if (name) {
            delete updates.name;
            delete updates.id;
            delete updates._csrf;
            console.log(updates);
            Branch.update(name, updates)
                .exec(function branchUpdated(err, branch) {
                    if (err) return err;

                    req.flash('message', 'Record Updated!');
                    res.redirect('/branch/edit?name='+name);
                });
        }
    }

};