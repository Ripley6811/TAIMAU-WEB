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
    - LINK - `order/new/"CO"`
    - LINK - `shipment/new/"CO"`
    - LINK - `shipment/showall/"CO"`
- `cogroup/index/suppliers` (*same as above*)
- `cogroup/index/customers` (*same as above*)
- `product/index`
    - LINK - `shipment/new/"CO"`
    - AJAX - `/database/get/products`
- `order/status`
    - LINK - `order/show/"ID"`
    - LINK - `shipment/pdf/"ID"`
- `analysis/index`

##### Sidebar: Specific company links (gold buttons)
- `cogroup/show/"CO"`
    - EJS - `branch/panel`
    - EJS - `contact/panel`
- `product/showall/"CO"`
    - EJS - `product/modal`
- `order/new/"CO"`
- `shipment/new/"CO"`
- `shipment/showall/"CO"`
    - LINK - `order/show/"ID"`
    - LINK - `shipment/pdf/"ID"`
- `report/index/"CO"`

##### Sidebar: Frequent company links (gold buttons)
- `shipment/showall/"CO"` (*see same link above*)

##### Admin/Other
- `admin/cogroup`
    - LINK - `cogroup/show/"CO"`
- `admin/branch`
- `admin/product`

| Abbrev. | Description |
|-|-|
| EJS | indicates an EJS partial embedded in parent page. |
| AJAX | A database AJAX query used in parent page. |
| LINK | Page is linked to by button in parent page. |
