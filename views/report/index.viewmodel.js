viewModel.ReportsVM = new (function () {
    var self = this;

    self.show_working_ko = ko.observable(false);
    self.taimao_ko = ko.observable('台茂化工儀器原料行');

    //TODO: (Pre)Load data when dates are set and display result
    //TODO: Enable download button when loading is complete.
    //EMBED HELP: http://stackoverflow.com/a/14958357/1172891
    self.arStartDate_ko = ko.observable();
    self.arEndDate_ko = ko.observable();
    self.download_ready_ko = ko.observable();
    self.include_totals_ko = ko.observable(true);
    self.item_subtotals_ko = ko.observable(false);
    self.include_clientname_ko = ko.observable(true);
    self.altTitle_ko = ko.observable('');
    self.jinchu_ko = ko.observable('all');
    self.availableProducts_ko = ko.observableArray();
    self.shipmentsItems = [];
    var isProductSupply = {};
    // Table header
    var headers = ['日期','出貨單號','品名','數量','單位','包裝','單價','總價','發票號碼'];
    var spacing = [ 12,    36,      58,   100,  114,   125,  140,  160,   176];
    self.headers_ko = ko.observableArray();
    headers.forEach(function (each) {
        self.headers_ko.push({name:each, selected_ko:ko.observable(true)})
    });

    /**
     * Creates PDF once data is loaded or when options change
     * but not date changes (that needs to load data separately).
     */
    self.create_activity_report_pdf = function () {
        self.show_working_ko(true);
        if (self.arStartDate_ko.peek() && self.arEndDate_ko.peek()) {
            var doc = new jsPDF();
            doc.setFont('Times', 'Roman');
            /**
             * Add non-ASCII printing function
             */
            doc.alttext = nonASCIItext;

            /**
             * Make list of selected products.
             */
            var show_products_list = [];
            self.availableProducts_ko.peek().forEach(function (each) {
                if (each.selected_ko.peek()) {
                    show_products_list.push(each.name);
                }
            });
            /**
             * Make new list of shipmentitems for processing
             */
            var selectedItems = [];
            self.shipmentsItems.forEach(function (each) {
                if (show_products_list.indexOf(each.product_label) >= 0) {
                    selectedItems.push(each);
                }
            });

            /**
             * Display a light grey grid for designing layout
             */
            if (false) {
                doc.setDrawColor(200);
                doc.setTextColor(200,200,200);
                for (var i=0; i<50; i++) {
                    doc.rect(0,i*10,300,10);
                    doc.text(0,i*10, (i*10).toString());
                    doc.rect(i*10,0,10,300);
                    doc.text(i*10,5, (i*10).toString());
                }
                doc.setDrawColor(0);
                doc.setTextColor(0,0,0);
            }


            /**
             * Create header section at top of PDF
             */
            var scale = 0.22;
            doc.addImage(taimauLogoURI, 'JPEG', 25, 5, 147*scale, 59*scale);
            doc.setFontSize(14);
            if (self.include_clientname_ko.peek()) doc.alttext(100, 15, '客戶名稱: <%= cogroup.name %>', 14);
            doc.alttext(100, 20, '日期:', 14);
            doc.text(113, 20, self.arStartDate_ko.peek() + ' ~ ' + self.arEndDate_ko.peek());
            doc.alttext(27, 22, self.taimao_ko.peek() || self.altTitle_ko.peek(), 12);

            doc.setFillColor(100);
            doc.rect(10, 25, 190, 1, 'F');


            function drawTableHead(ypos) {
                for (var i=0; i<headers.length; i++) {
                    if (self.headers_ko.peek()[i].selected_ko.peek()) doc.alttext(spacing[i], ypos, headers[i], 11);
                }
                doc.rect(10, ypos+1, 190, 0.2, 'F');
            }
            drawTableHead(30);

            var page_adjust = 0,
                j = 0;
            for (j=0; j<selectedItems.length; j++) {
                var si = selectedItems[j],
                    ypos = 35+j*5-page_adjust,
                    date = si['shipmentdate'];
                date = [date.getFullYear(),date.getMonth()+1,date.getDate()].join('-');

                if (self.headers_ko.peek()[0].selected_ko.peek()) doc.alttext(spacing[0], ypos, date, 11);
                if (self.headers_ko.peek()[1].selected_ko.peek()) doc.alttext(spacing[1], ypos, si['shipment_no'], 11);
                var nameBump = self.headers_ko.peek()[1].selected_ko.peek() ? 2 : 1;
                if (self.headers_ko.peek()[2].selected_ko.peek()) doc.alttext(spacing[nameBump], ypos, si['product_label'], 11);
                if (self.headers_ko.peek()[3].selected_ko.peek()) doc.alttext(spacing[3], ypos, (si['qty']*si['units']).toString(), 11);
                if (self.headers_ko.peek()[4].selected_ko.peek()) doc.alttext(spacing[4], ypos, si['UM'], 11);
                var skusText = si['SKU'] == '槽車' ? '槽車' : [si['qty'], si['SKU']].join(' ');
                if (self.headers_ko.peek()[5].selected_ko.peek()) doc.alttext(spacing[5], ypos, skusText, 11);
                if (self.headers_ko.peek()[6].selected_ko.peek()) doc.alttext(spacing[6], ypos, si['price'].toString(), 11);
                if (self.headers_ko.peek()[7].selected_ko.peek()) doc.alttext(spacing[7], ypos, si['value'].toString(), 11);
                if (self.headers_ko.peek()[8].selected_ko.peek()) doc.alttext(spacing[8], ypos, si['invoice_no'], 11);
                if (ypos > 260) {
                    doc.addPage();
                    drawTableHead(15);
                    page_adjust = j*5+20;
                }
            }

            /**
             * Print the subtotal, tax and total.
             */
            if (self.include_totals_ko.peek()) {
                // Calculate total and tax total
                var total = 0;
                var tax = 0;
                selectedItems.forEach(function (each) {
                    total += each['value'];
                    tax += each['value']*0.05;
                });
              
                total = Math.round(total);
                tax = Math.round(tax);

                // Write totals
                ypos = 35+j*5-page_adjust+0.1;
                doc.alttext(spacing[6], ypos, '合計:', 11);
                doc.alttext(spacing[7], ypos, total.toString(), 11);
                ypos = 35+j*5-page_adjust+5.1;
                doc.alttext(spacing[6], ypos, '稅捐:', 11);
                doc.alttext(spacing[7], ypos, tax.toString(), 11);
                ypos = 35+j*5-page_adjust+10.1;
                doc.alttext(spacing[6], ypos, '總計:', 11);
                doc.alttext(spacing[7], ypos, (total+tax).toString(), 11);
                doc.setFillColor(100);
                doc.rect(spacing[6], ypos-14, spacing[8]-spacing[6], 0.2, 'F');
                doc.rect(spacing[6], ypos+1, spacing[8]-spacing[6], 1, 'F');
            }

            /**
             * Print per item totals on another page
             */
            if (self.item_subtotals_ko.peek()) {
                var totals = {},
                    counts = {},
                    trips = {},
                    danwei = {},
                    ypos = 15+j*5;

                selectedItems.forEach(function (each) {
                    if (!totals[each.product_label]) {
                        totals[each.product_label] = 0;
                        counts[each.product_label] = 0;
                        trips[each.product_label] = 0;
                        danwei[each.product_label] = each.UM;
                    }
                    totals[each.product_label] += each['value'];
                    counts[each.product_label] += Math.round(each['qty']*each['units']);
                    trips[each.product_label] += 1;
                });

                doc.addPage();
                var ypos = 20;
                for (var key in totals) {
                    doc.alttext(20, ypos, key, 11);
                    doc.alttext(80, ypos, trips[key] + " 趟", 11);
                    doc.alttext(110, ypos, counts[key] + " " + danwei[key], 11);
                    doc.alttext(140, ypos, "$ " + Math.round(totals[key]), 11);
                    ypos += 5;
                }

            }


            // Output result to PDF iframe
            var pp = document.getElementById('preview-pane');
            pp.src = doc.output('bloburi');

        }
        self.show_working_ko(false);
    };

    /**
     * Listen for start and end dates both set
     * Then load data and create PDF
     */
    ko.computed(function () {
        if (self.arStartDate_ko() && self.arEndDate_ko()) {
            self.show_working_ko(true);
            params = {
                _csrf: '<%= _csrf %>',
                id: '<%= cogroup.name %>',
                startDate: (new Date(self.arStartDate_ko.peek())).toISOString(),
                endDate: (new Date(self.arEndDate_ko.peek())).toISOString(),
            };
            post('/database/get/activityreport', params, function(response) {
                self.shipmentsItems = [];
                var pname_set = [];
                // Add shipment record data to array
                for (var i=0; i<response.length; i++) {
                    self.shipmentsItems.push(new KO_ShipmentListRow(response[i]));
                    pname_set.push(self.shipmentsItems[i].product_label);
                    isProductSupply[self.shipmentsItems[i].product_label] =
                        self.shipmentsItems[i].is_supply
                }
                // Create available products list for selecting items
                self.availableProducts_ko.removeAll();
                pname_set = new Set(pname_set);
                pname_set.forEach(function(each) {
                    self.availableProducts_ko.push({
                        name: each,
                        selected_ko: ko.observable(true)
                    });
                });
                // (Re)Load PDF
                self.create_activity_report_pdf();
            });
        }
    });

    /**
     * Listen for option changes and reload PDF
     */
    ko.computed(function () {
        console.log('OTHER listeners');
        // Listen for product selected toggle
        for (var i=0; i<self.availableProducts_ko().length; i++) {
            self.availableProducts_ko()[i].selected_ko();
        }
        // Listen for header selected toggle
        for (var i=0; i<self.headers_ko().length; i++) {
            self.headers_ko()[i].selected_ko();
        }
        self.taimao_ko();  // branch toggle
        self.include_totals_ko();  // show totals toggle
        self.item_subtotals_ko();  // show item counts toggle
        self.include_clientname_ko();
        self.altTitle_ko();
        // Reload PDF if not currently working
        if (!self.show_working_ko.peek()) {
            self.show_working_ko(true);
            self.create_activity_report_pdf();
        }
    });

    /**
     * Listen for incoming-outgoing toggle change
     */
    ko.computed(function () {
        console.log('JINCHU_ko listener', self.show_working_ko.peek());
        self.jinchu_ko();  // incoming-outgoing toggle
        if (!self.show_working_ko.peek()) {
            self.show_working_ko(true);
            for (var i=0; i<self.availableProducts_ko.peek().length; i++) {
                var item = self.availableProducts_ko.peek()[i];
                if (isProductSupply[item.name] && self.jinchu_ko.peek() === '進') {
                    item.selected_ko(true);
                } else if (!isProductSupply[item.name] && self.jinchu_ko.peek() === '出') {
                    item.selected_ko(true);
                } else if (self.jinchu_ko.peek() === 'all') {
                    item.selected_ko(true);
                } else {
                    item.selected_ko(false);
                }
            }
            // Reload PDF
            self.create_activity_report_pdf();
        }
    });
})();
