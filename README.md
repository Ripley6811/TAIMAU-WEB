# TAIMAU-WEB
Browser based database management for TAIMAU.

- **Sails.JS** framework
- **jsPDF** client-side PDF generation
- **Knockout.JS** client-side data-interaction MVVM
- **Bootstrap** css to bootstrap the front-end design
- **Font-Awesome** icons

## Page/Link Mapping
##### Main page links (`static/index`)
- `shipment/showall/"CO"`
- `cogroup/new`

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
    - **EJS** - `contact/panel`
- `product/showall/"CO"`
    - **EJS** - `product/modal`
- `order/new/"CO"`
- `shipment/new/"CO"`
- `shipment/showall/"CO"`
    - **Link** - `order/show/"ID"`
    - **Link** - `shipment/pdf/"ID"`
- `report/index/"CO"`

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
