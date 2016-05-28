function BranchesVM() {
    var self = this;
    // Make branchNames available to contactsVM for selection.
    self.branchNames = viewModel.branchNames = ko.observableArray();

    self.currentBranch = ko.observable();
    self.modalVisible = ko.observable(false);
    document.onkeydown = function(evt) {
        if (evt.keyCode == 27 && self.modalVisible()) {
            self.modalVisible(false);
        }
    };
    self.showModal = function(clickedItem) {
        //console.log(clickedItem.name());
        self.currentBranch(clickedItem);
        self.modalVisible(true);
    };
    self.printDetails = function(item) {
        console.log(item);
    };

    self.branches = ko.observableArray();
    self.addBranch = function() {
        var newBranch = new KO_Branch();
        newBranch.group(viewModel.co_name);
        newBranch.nameLock(false);
        newBranch.saved(false);
        self.branches.push(newBranch);
    };
    self.removeBranch = function(branch) {
        var params = {
            _csrf: viewModel._csrf,
            co_name: viewModel.co_name,
            name: branch.name
        };
        post('/branch/destroy', params, function(response) {
            if (response.status !== 400 && response.group === viewModel.co_name) {
                branch.name(null);
                branch.saved(false);
                self.branches.remove(branch);
            } else {
                alert(JSON.stringify(response, null, '  '));
            }
        });
    };

    self.saveBranch = function(branch) {
        var params = {
            _csrf: viewModel._csrf,
            co_name: viewModel.co_name,
            branch: branch
        };
        // XXX: Update or create? or just create.
        post('/database/save/branch', params, function(response) {
            if (response.status !== 400 && response.group === viewModel.co_name) {
                branch.name(response.name);
                branch.saved(true);
                branch.nameLock(true);
            } else {
                alert(JSON.stringify(response, null, '  '));
            }
        });
    };

    self.getBranches = function () {
        var params = {
            _csrf: viewModel._csrf,
            id: viewModel.co_name
        };
        post('/database/get/branches', params, function(response) {
            self.branches.removeAll();
            self.branchNames.removeAll();
            for (var i=0; i<response.length; i++) {
                self.branches.push(new KO_Branch(response[i]));
                self.branchNames.push(response[i].name);
            }
        });
    };

    self.getBranches();
}

viewModel.branchesVM = new BranchesVM();