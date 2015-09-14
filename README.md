# TAIMAU-WEB
Browser based database management for TAIMAU.

- **Sails.JS** framework
- **jsPDF** client-side PDF generation
- **Knockout.JS** client-side data-interaction MVVM
- **Bootstrap** css to bootstrap the front-end design
- **Font-Awesome** icons

## Page/Link Mapping
##### Main page links (`static/index`)
- shipment/showall/"CO"
- cogroup/new

##### Sidebar: Comprehensive links (green buttons)
- `cogroup/index.html`
    - `order/new/"CO"`
    - shipment/new/"CO"
    - shipment/showall/"CO"
- cogroup/index/suppliers (*same as above*)
- cogroup/index/customers (*same as above*)
- product/index
    - shipment/new/"CO"
- order/status
    - order/show/"ID"
    - shipment/pdf/"ID"
- analysis/index

##### Sidebar: Specific company links (gold buttons)
- cogroup/show/"CO"
    - *branch/modal*
    - *contact/modal*
- product/showall/"CO"
    - *product/modal*
- order/new/"CO"
- shipment/new/"CO"
- shipment/showall/"CO"
    - order/show/"ID"
    - shipment/pdf/"ID"
- report/index/"CO"

##### Sidebar: Frequent company links (gold buttons)
- shipment/showall/"CO" (*see same link above*)

*italics* indicates used as modal or embedded in higher page.
