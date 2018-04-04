module.exports = {


  friendlyName: 'View new category',


  description: 'Display "New category" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/category/create-category'
    }

  },


  fn: async function (inputs, exits) {
    let existingCategories = await Category.find();
    let categoryArr = [];
    for (var i = 0; i < existingCategories.length; i++) {
      categoryArr.push(existingCategories[i].name);
    }

    // Respond with view.
    return exits.success({
      categories: categoryArr
    });

  }


};
