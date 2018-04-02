module.exports = {


  friendlyName: 'View new category',


  description: 'Display "New category" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/admin/new-category'
    }

  },


  fn: async function (inputs, exits) {

    // Respond with view.
    return exits.success();

  }


};
