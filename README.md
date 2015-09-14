# TAIMAU-WEB
Browser based database management for TAIMAU.

- **Sails.JS** framework
- **jsPDF** client-side PDF generation
- **Knockout.JS** client-side data-interaction MVVM
- **Bootstrap** css to bootstrap the front-end design
- **Font-Awesome** icons

## Page/Link Mapping
##### Main page links (`static/index`)
- `shipment/showall/"CO"` (*see same link below*)
- `cogroup/new`
    - **Form** - `/cogroup/create`
        - **Link** - `cogroup/show/"CO"` (submit redirects here)

##### Sidebar: Comprehensive links (green buttons)
- `cogroup/index.html`
    - **Link** - `order/new/"CO"`
    - **Link** - `shipment/new/"CO"`
    - **Link** - `shipment/showall/"CO"`
- `cogroup/index/suppliers` (*same as above*)
- `cogroup/index/customers` (*same as above*)
- `product/index`
    - **Link** - `shipment/new/"CO"`
    - **Ajax** - `/database/get/products`
- `order/status`
    - **Link** - `order/show/"ID"`
    - **Link** - `shipment/pdf/"ID"`
- `analysis/index`

##### Sidebar: Specific company links (gold buttons)
- `cogroup/show/"CO"`
    - **EJS** - `branch/panel`
        - **Ajax** - `/branch/destroy`
        - **Ajax** - `/database/save/branch`
        - **Ajax** - `/database/get/branches`
    - **EJS** - `contact/panel`
        - **Ajax** - `/database/get/branches`
        - **Ajax** - `/contact/destroy`
        - **Ajax** - `/contact/updateOrCreate`
        - **Ajax** - `/database/get/contacts`
    - **Link** - `/cogroup/destroy/"CO"`
- `product/showall/"CO"`
    - **EJS** - `product/modal`
        - **Ajax** - `/database/get/product`
        - **Ajax** - `/database/save/product`
        - **Ajax** - `/database/update/product`
    - **Ajax** - `/product/destroy`
    - **Ajax** - `/product/updateOrCreate`
    - **Ajax** - `/product/merge`
- `order/new/"CO"`
    - **Ajax** - `/database/get/recent_pos`
    - **Form** - `/order/create`
- `shipment/new/"CO"`
    - **Ajax** - `/product/get`
    - **Ajax** - `/order/getOpen`
    - **Ajax** - `/database/update/order`
    - **Ajax** - `/shipment/availableNumber`
    - **EJS** - `shipment/multi`
        - **Ajax** - `/database/get/product`
        - **Ajax** - `/database/save/multipleshipments`
            - **Link** - `shipment/showall/"CO"` (callback redirect)
    - **Form** - `/shipment/create`
        - **Link** - `shipment/showall/"CO"` (submit redirects here)
- `shipment/showall/"CO"`
    - **EJS** - `invoice/modal`
    - **Ajax** - `/database/get/shipmentitems`
    - **Ajax** - `/database/get/invoiceitems`
    - **Link** - `order/show/"ID"`
    - **Link** - `shipment/pdf/"ID"`
- `report/index/"CO"`
    - **Ajax** - `/database/get/activityreport`

##### Sidebar: Frequent company links (gold buttons)
- `shipment/showall/"CO"` (*see same link above*)

##### Admin/Other
- `admin/cogroup`
    - **Link** - `cogroup/show/"CO"`
    - **Ajax** - `/database/update/cogroup`
    - **Ajax** - `/database/destroy/cogroup`
- `admin/branch`
    - **Link** - `cogroup/show/"CO"`
    - **Ajax** - `/database/update/branch`
    - **Ajax** - `/database/destroy/branch`
- `admin/product`
    - **Link** - `product/showall/"CO"`
    - **Ajax** - `/database/update/product`
    - **Ajax** - `/database/destroy/product`

|   |   |
|---|---|
| **EJS** | indicates an EJS partial embedded in parent page. |
| **Ajax** | A database AJAX query used in parent page. |
| **Link** | Page is linked to by button or action in parent page. |
| **Form** | Form submission link. |
