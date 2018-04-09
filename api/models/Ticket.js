/**
 * Ticket.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    subject: {
      type: 'string',
      required: true,
      maxLength: 128,
      description: 'Subject line summary of ticket issue',
      example: "Life's not FAIR!!!"
    },

    body: {
      type: 'string',
      required: true,
      maxLength: 16383, //MySQL Text field limit divided by 4 bytes per character
      description: 'Detailed description of issue'
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    creator: {
      model: 'user'
    },

    statuses: {
      collection: 'status',
      via: 'ticket',
      through: 'ticketstatus'
    },

    statushist: {
      collection: 'ticketstatus',
      via: 'ticket'
    },

    category: {
      model: 'category'
    },

    responses: {
      collection: 'response',
      via: 'ticket'
    }

  },

};
