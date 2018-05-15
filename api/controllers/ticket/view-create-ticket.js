module.exports = {


  friendlyName: 'View new ticket',


  description: 'Display "New ticket" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/ticket/create-ticket'
    }

  },


  fn: async function (inputs, exits) {

    let ticketCategories = await Category.find();
    let ticketStatuses = await Status.find({active: true});

    // Respond with view.
    return exits.success({
      categories: ticketCategories,
      statuses: ticketStatuses
    });

  }


};
