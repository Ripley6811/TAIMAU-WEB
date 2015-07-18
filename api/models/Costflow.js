/**
 * Costflow.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'costflow',
    schema: true,
    autoPK: true,
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: {
        // id: { ... },
        // createAt: { ... },
        // updatedAt: { ... },

        materials: {
            collection: 'costflowraw',
            via: 'costflow'
        },
        product: {
            model: 'product',
            required: true
        },
        finished_qty: {
            type: 'float',
            required: true
        },
        work_hours: {
            type: 'float'
        },
        other_cost: {
            type: 'float'
        }
    }
};
