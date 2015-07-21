/**
* Costflowraw.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
    tableName: 'costflowraw',
    schema: true,
    autoPK: true,
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: {
        // id: { ... },
        // createAt: { ... },
        // updatedAt: { ... },

        costflow: {
            model: 'costflow',
            required: true
        },
        product: {
            model: 'product',
            via: 'id',
            required: true
        },
        raw_qty: {
            type: 'float',
            required: true
        }
    }
};
