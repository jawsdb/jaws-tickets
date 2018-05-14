module.exports = {


  friendlyName: 'View new status',


  description: 'Display "New status" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/status/create-status'
    }

  },


  fn: async function (inputs, exits) {
    let existingStatuses = await Status.find();

    // Respond with view.
    return exits.success({
      statuses: existingStatuses
    });

  }


};
