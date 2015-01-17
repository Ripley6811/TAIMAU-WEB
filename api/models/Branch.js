/**
 * Branch.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    schema: true,  // Follow schema. Only allows values in attributes.
    autoPK: false,  // Do not use 'id' field
    autoCreatedAt: false,  // Do not use 'createAt' field
    autoUpdatedAt: false,  // Do not use 'updatedAt' field

    attributes: {
        name: {
            type: 'string',
            unique: true,
            primaryKey: true,
            required: true
        },
        group: {
            model: 'cogroup',
            required: true
        },
        fullname: {
            type: 'string',
            defaultsTo: ''
        },
        english_name: {
            type: 'string',
            defaultsTo: ''
        },
        tax_id: {
            type: 'string',
            defaultsTo: ''
        },
        phone: {
            type: 'string',
            defaultsTo: ''
        },
        fax: {
            type: 'string',
            defaultsTo: ''
        },
        email: {
            type: 'string',
            defaultsTo: ''
        },
        note: {
            type: 'string',
            defaultsTo: ''
        },
        address_office: {
            type: 'string',
            defaultsTo: ''
        },
        address_shipping: {
            type: 'string',
            defaultsTo: ''
        },
        address_billing: {
            type: 'string',
            defaultsTo: ''
        },
        address: {
            type: 'string',
            defaultsTo: ''
        },
        is_active: {
            type: 'boolean',
            defaultsTo: true
        }
    }
};