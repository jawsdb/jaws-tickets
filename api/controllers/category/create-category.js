module.exports = {


  friendlyName: 'Category',


  description: 'Category objects.',


  inputs: {
    categoryName: {
      type: 'string',
      required: true,
      example: 'JawsDB Maria'
    }
  },


  exits: {
    noCategoryNameSupplied: {
      statusCode: 400,
      description: 'No Category Name was supplied.'
    },

    categoryExists: {
      statusCode: 409,
      description: 'The provided Category already exists.',
    }
  },


  fn: async function (inputs, exits) {

    if (!inputs.categoryName) {
      throw 'noCategoryNameSupplied';
    }

    let conflictingCategory = await Category.findOne({
      name: inputs.categoryName
    });
    if (conflictingCategory) {
      throw 'categoryExists';
    }

    await Category.create({
      name: inputs.categoryName
    });

    return exits.success();

  }


};
