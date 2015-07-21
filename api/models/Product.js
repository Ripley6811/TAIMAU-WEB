/**
 * Product.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    schema: true,
    autoPK: false,
    autoCreatedAt: false,
    autoUpdatedAt: false,
    attributes: {
        id: {
            type: 'int',
            unique: true,
            required: true
        },
        MPN: {
            type: 'string',
            unique: true,
            primaryKey: true,
            required: true
        },
        group: {
            model: 'cogroup',
            required: true
        },

        inventory_name: {
            type: 'string',
            required: true
        },
        product_label: {
            type: 'string',
            defaultsTo: ''
        },
        english_name: {
            type: 'string',
            defaultsTo: ''
        },

        units: {
            type: 'float',
            required: true
        },
        UM: {
            type: 'string',
            required: true
        },
        SKUlong: {
            type: 'string',
            defaultsTo: ''
        },
        SKU: {
            type: 'string',
            required: true
        },
        note: {
            type: 'string',
            defaultsTo: ''
        },
        ASE_PN: {
            type: 'string',
            defaultsTo: ''
        },
        ASE_RT: {
            type: 'string',
            defaultsTo: ''
        },
        orders: {
            collection: 'order',
            via: 'MPN'
        },
        discontinued: {
            type: 'boolean',
            defaultsTo: false
        },
        is_supply: {
            type: 'boolean',
            defaultsTo: false
        },
        unitpriced: {
            type: 'boolean',
            defaultsTo: false
        },
        curr_price: {
            type: 'float',
            defaultsTo: 0.0
        },
        json: {
            type: 'json',
            defaultsTo: {}
        },
        optionsText: function () {
            var text = this.group + ': ' + this.inventory_name;
            text += ' — ' + this.units + this.UM + ' ' + this.SKU;
            text += ' — $' + this.curr_price + '/';
            text += this.unitpriced ? this.UM : this.SKU;
            return text;
        }
    },

//    beforeValidate: function (values, cb) {
//        //calling cb() with an argument returns an error. Useful for canceling the entire operation if some criteria fails.
//        cb();
//    }
};
