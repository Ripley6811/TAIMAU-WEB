var viewModel = viewModel || {};

// Activate Bootstrap's tooltips (opt-in function).
$('[data-toggle="tooltip"]').tooltip();

viewModel.SidebarVM = new (function () {
    'use strict';
    var self = this;

    self.user = ko.observable();
    self.user_name = ko.observable();
    self.user_password = ko.observable();
    self.log_in = function () {
        if (self.user_password() === "$" && self.user_name() !== "") {
            window.localStorage.setItem("user", JSON.stringify({
                money: true,
                name: self.user_name(),
            }));
            self.user(self.user_name());
            window.location.reload();
        }
    };

    if (JSON.parse(window.localStorage.getItem("user"))) {
        self.user(JSON.parse(window.localStorage.getItem("user")).name);
    }
    self.log_out = function () {
        window.localStorage.setItem("user", null);
        self.user_password("");
        self.user_name("");
        self.user(null);
        window.location.reload();
    };

    self.company_id = ko.observable('<%= res.locals.cogroup ? cogroup.name : "" %>')

    self.branchesArray = ko.observableArray(
        <%- res.locals.cogroup ? JSON.stringify(cogroup.branches) : "[]" %>
    );

    self.recent_companies = ko.observableArray([]);

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

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1);
            if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
        }
        return "";
    }

    // Populate company buttons if no company is selected
    if (self.company_id() === '') {
        // Get from 'co_list' cookie if exists else AJAJ and set cookie
        var cookieStr = getCookie('co_list');
        var cl_index = cookieStr.indexOf('co_list');
        if (cookieStr != '') {
            var res = JSON.parse(cookieStr);
            // Show first few items
            self.company_list.removeAll();
            res.slice(0, 20).forEach(function(name) {
                self.company_list.push(name);
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
                    self.company_list.push(name);
                });
            };
            xmlhttp.open('GET', '/cogroup/namelist', true);
            xmlhttp.send();
        }
    }

    // Populate recently used companies in sidebar list from cookie
    var recentCompanyStr = 'recent_companies';
    var cookieStr = getCookie(recentCompanyStr);
    if (cookieStr != '') {
        var res = JSON.parse(cookieStr);
        self.recent_companies.removeAll();
        res.slice(0, 16).forEach(function(name) {
            self.recent_companies.push(name);
        });
    }

    // Add currently open company to list
    if (self.company_id() != '') {
        self.recent_companies.remove(self.company_id());
        self.recent_companies.unshift(self.company_id());
        var path = '; path=/';
        document.cookie = recentCompanyStr + "=" + ko.toJSON(self.recent_companies) + path;
    }

    self.loadCompany = function (branch) {
        window.location = '/shipment/showall/' + branch;
    };
});
