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
    let statusArr = [];
    for (var i = 0; i < existingStatuses.length; i++) {
      statusArr.push(existingStatuses[i].name);
    }

    // Respond with view.
    return exits.success({
      statuses: statusArr
    });

  }


};
