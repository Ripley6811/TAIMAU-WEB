
/**
 * Knockout.js model for mobile device dropdown menu
 */
function NavModel() {
    var self = this;
    
    self.showNavMenu = ko.observable(true);
    
    self.toggleMenu = function() {
        self.showNavMenu(!self.showNavMenu());
    };
}

function addCompanyNavButtons(co_name) {
    var labelsLinks = [
        ['<i class="glyphicon glyphicon-info-sign"></i> <strong>' + co_name + '</strong>', '/cogroup/show/' + co_name],
        ['<strong>創造一個訂單</strong>', '/order/new/' + co_name],
        ['<strong>管理訂單與到期日</strong>', '/order/showall/' + co_name],
        ['<strong>創造出貨單</strong>', '/shipment/new/' + co_name],
//        ['<strong>創造發票</strong>', '/'],
//        ['<strong>管理出貨單與發票</strong>', '/']
    ];
    var navButtons = document.getElementById('navButtons');
    
    for (var i=0; i<labelsLinks.length; i++) {
        var newLink = document.createElement('A');
        newLink.className = 'btn btn-custom';
        newLink.innerHTML = labelsLinks[i][0];
        newLink.href = labelsLinks[i][1];
        navButtons.appendChild(newLink);
    }
}