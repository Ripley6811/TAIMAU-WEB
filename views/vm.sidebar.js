var viewModel = viewModel || {};

// Activate Bootstrap's tooltips (opt-in function).
$('[data-toggle="tooltip"]').tooltip();

viewModel.SidebarVM = new (function () {
    'use strict';
    var self = this;

    self.user = ko.observable(null);
    self.user_name = ko.observable();
    self.user_password = ko.observable();
    self.log_in = function () {

    };
    self.log_out = function () {

    };

    self.company_id = ko.observable('<%= res.locals.cogroup ? cogroup.name : "" %>')

    self.branchesArray = ko.observableArray(
        <%- res.locals.cogroup ? JSON.stringify(cogroup.branches) : "[]" %>
    );

    self.showBranch = function (branch) {
        self.branchname(branch.name);
        self.fullname(branch.fullname);
        self.tax_id(branch.tax_id);
        self.phone(branch.phone);
        self.fax(branch.fax);
        self.email(branch.email);
        self.note(branch.note);
    }

    self.branchname = ko.observable();
    self.fullname = ko.observable();
    self.tax_id = ko.observable();
    self.phone = ko.observable();
    self.fax = ko.observable();
    self.email = ko.observable();
    self.note = ko.observable();

    self.load_company = function (name) {
        self.company_id(name);
    };

    if (self.branchesArray().length > 0) {
        self.showBranch(self.branchesArray()[0]);
    }


    self.company_list = ko.observableArray([]);

    // Populate company buttons if no company is selected
    if (self.company_id() === '') {
        // Get from 'co_list' cookie if exists else AJAJ and set cookie
        var cookieStr = document.cookie;
        var cl_index = cookieStr.indexOf('co_list');
        if (cl_index >= 0) {
            var res = JSON.parse(cookieStr.substring(cl_index+8));
            // Show first few items
            self.company_list.removeAll();
            res.slice(0, 20).forEach(function(name) {
                self.company_list.push({'name':name});
            });
            // Use lines below to delete 'co_list' cookie
//                var d = new Date();
//                document.cookie=['co_list=', 'expires='+d.toUTCString(), 'path=/'].join('; ');
        } else {
            // AJAJ request for company list
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState !== 4) return;
                // Save list as 'co_list' cookie that expires in 24 hours
                var d = new Date();
                d.setTime(d.getTime() + 24*60*60*1000);
                var c_data = 'co_list=' + xmlhttp.response.replace(/[\n\r/ ]/g, '');
                var expires = 'expires=' + d.toUTCString();
                document.cookie=[c_data, expires, 'path=/'].join('; ');

                var res = JSON.parse(xmlhttp.response);
                // Show first few items
                self.company_list.removeAll();
                res.slice(0, 20).forEach(function(name) {
                    self.company_list.push({'name':name});
                });
            };
            xmlhttp.open('GET', '/cogroup/namelist', true);
            xmlhttp.send();
        }
    }

    self.loadCompany = function (branch) {
        window.location = '/shipment/showall/' + branch.name;
    };
});