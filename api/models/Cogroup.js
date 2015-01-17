/**
 * Cogroup.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    schema: true, // Follow schema. Only allows values in attributes.
    autoPK: false, // Do not use 'id' field
    autoCreatedAt: false, // Do not use 'createAt' field
    autoUpdatedAt: false, // Do not use 'updatedAt' field

    attributes: {
        name: {
            type: 'string',
            required: true,
            unique: true,
            primaryKey: true
        },
        is_active: {
            type: 'boolean',
            defaultsTo: true,
        },
        is_supplier: {
            type: 'boolean',
            defaultsTo: true,
        },
        is_customer: {
            type: 'boolean',
            defaultsTo: true,
        }
    }
};