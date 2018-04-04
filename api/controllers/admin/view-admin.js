module.exports = {


  friendlyName: 'View admin',


  description: 'Display "Admin" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/admin/admin',
      description: 'Display the admin page for super admins'
    }

  },


  fn: async function (inputs, exits) {

    // Respond with view.
    return exits.success();

  }


};
