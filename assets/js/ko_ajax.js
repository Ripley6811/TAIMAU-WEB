/**
 * Methods involving AJAX requests.
 */

//getProducts = function (params, callback) {
//    getTemplate('/product/get', params, function (res_records) {
//        // Sort by rank value.
//        res_records.sort(function (a, b) {
//            return a.json.rank - b.json.rank;
//        });
//        callback(res_records);
//    });
//};

//getOrders = function (params, callback) {
//    getTemplate('/order/getOpen', params, function (res_records) {
//        // Sort by rank value.
//        res_records.sort(function (a, b) {
//            return a.MPN.json.rank - b.MPN.json.rank;
//        });
//        callback(res_records);
//    });
//};

getShipments = function (params, callback) {
    getTemplate('/database/get/shipments', params, function (res_records) {
        // Sort by rank value.
        res_records.sort(function (a, b) {
            return b.shipmentdate - a.shipmentdate;
        });
        callback(res_records);
    });
};

getShipmentitems = function (params, callback) {
    getTemplate('/database/get/shipmentitems', params, function (res_records) {
        // Sort by rank value.
        res_records.sort(function (a, b) {
            return b.shipment_id.shipmentdate - a.shipment_id.shipmentdate;
        });
        callback(res_records);
    });
};

getTemplate = function (url, params, callback) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState !== 4) return;
        var db_records = JSON.parse(xmlhttp.response);
        callback(db_records);
    };
    xmlhttp.open('POST', url, true);
    xmlhttp.setRequestHeader('Content-type', 'application/json');
    xmlhttp.send(ko.toJSON(params));
};

/**
 * Simplified "post" method that includes converting Knockout objects to JSON
 * before sending and parses response to JSON before executing callback.
 * @param {String}   url      Server routing address.
 * @param {Object}   params   Object containing "_csrf" and other objects.
 * @param {Function} callback Callback function.
 */
post = function (url, params, callback) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState !== 4) return;
        callback(JSON.parse(xmlhttp.response));
    };
    xmlhttp.open('POST', url, true);
    xmlhttp.setRequestHeader('Content-type', 'application/json');
    xmlhttp.send(ko.toJSON(params));
};
