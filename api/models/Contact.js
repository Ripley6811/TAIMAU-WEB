/**
* Contact.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

    schema: true,  // Follow schema. Only allows values in attributes.
//    autoPK: false,  // Do not use 'id' field
    autoCreatedAt: false,  // Do not use 'createAt' field
    autoUpdatedAt: false,  // Do not use 'updatedAt' field

  attributes: {

//        id: {
//            type: 'integer',
//            unique: true,
//            primaryKey: true,
//            required: true,
//            autoIncrement: true
//        },
        group: {
            model: 'cogroup',
            required: true
        },
        branch: {
            model: 'branch',
            required: false
        },
        name: {
            type: 'string',
            defaultsTo: ''
        },
        position: {
            type: 'string',
            defaultsTo: ''
        },
        phone: {
            type: 'string',
            defaultsTo: ''
        },
        cell: {
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
        }
  }
};

