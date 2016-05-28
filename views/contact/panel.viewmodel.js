function ContactsVM() {
    var self = this,
        co_name = viewModel.co_name,
        _csrf = viewModel._csrf;

    self.branchNames = viewModel.branchNames || ko.observableArray();

    // TODO: Figure out how to make sure the branch names stay updated.
    // For now, just have to refresh screen as needed.
    // One option is to NOT use observableArray for each contact row.
    self.getBranchNames = function () {
        var params = {_csrf: _csrf, id: co_name};
        post('/database/get/branches', params, function(response) {
            // Recreate branch name options list.
            self.branchNames.removeAll();
            for (var i=0; i<response.length; i++) {
                self.branchNames.push(response[i].name);
            }
        });
    };
    if (self.branchNames().length == 0) self.getBranchNames();

    /**
     * CONTACT section controls
     */
    self.contacts = ko.observableArray();
    self.addContact = function() {
        var newContact = new KO_Contact();
        newContact.group(co_name);
        self.contacts.push(newContact);
    };
    self.removeContact = function(contact) {
        var params = {
            _csrf: _csrf,
            co_name: co_name,
            id: contact.id
        };
        post('/contact/destroy', params, function(response) {
            if (response.status !== 400 && response.group === co_name) {
                contact.id(null);
                contact.saved(false);
                // Optionally remove contact from view.
                self.contacts.remove(contact);
            } else {
                alert(JSON.stringify(response, null, '  '));
            }
        });
    };

    self.saveContact = function(contact) {
        var params = {
            _csrf: _csrf,
            co_name: co_name,
            contact: contact
        };
        post('/contact/updateOrCreate', params, function(response) {
            console.log(response);
            if (response.status !== 400 && response.group === co_name) {
                contact.id(response.id);
                contact.saved(true);
            } else {
                alert(JSON.stringify(response, null, '  '));
            }
        });
    };

    self.getContacts = function () {
        var params = {
            _csrf: _csrf,
            id: co_name
        };
        post('/database/get/contacts', params, function(response) {
            var db_contacts = response;

            self.contacts.removeAll();
            for (var i=0; i<db_contacts.length; i++) {
                self.contacts.push(new KO_Contact(db_contacts[i]));
            }
        });
    };
//    self.getBranchNames();

    self.getContacts();
    // Update contacts if the branchNames array changes.
    ko.computed(function () {
        self.branchNames();
        self.getContacts();
    });
}

viewModel.contactsVM = new ContactsVM();