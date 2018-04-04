module.exports = {


  friendlyName: 'Status',


  description: 'Status objects.',


  inputs: {
    statusName: {
      type: 'string',
      required: true,
      example: 'JawsDB Maria'
    }
  },


  exits: {
    noStatusNameSupplied: {
      statusCode: 400,
      description: 'No Status Name was supplied.'
    },

    statusExists: {
      statusCode: 409,
      description: 'The provided Status already exists.',
    }
  },


  fn: async function (inputs, exits) {

    if (!inputs.statusName) {
      throw 'noStatusNameSupplied';
    }

    let conflictingStatus = await Status.findOne({
      name: inputs.statusName
    });
    if (conflictingStatus) {
      throw 'statusExists';
    }

    await Status.create({
      name: inputs.statusName
    });

    return exits.success();

  }


};
