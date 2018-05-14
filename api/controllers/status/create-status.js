module.exports = {


  friendlyName: 'Status',


  description: 'Status objects.',


  inputs: {
    statusName: {
      type: 'string',
      required: true,
      example: 'Closed'
    },

    description: {
      type: 'string',
      required: true,
      example: 'Ticket has been completed.'
    },

    isClosedStatus: {
      type: 'string',
      example: 'Ticket has been completed.'
    },
  },


  exits: {
    missingInputs: {
      statusCode: 400,
      description: 'Certain status fields were not supplied.'
    },

    statusExists: {
      statusCode: 409,
      description: 'The provided Status already exists.',
    }
  },


  fn: async function (inputs, exits) {
    sails.log.debug(inputs);

    if (!inputs.statusName) {
      throw 'missingInputs';
    }

    if (!inputs.description) {
      throw 'missingInputs';
    }

    if (!inputs.isClosedStatus) {
      inputs.isClosedStatus = false;
    }

    let conflictingStatus = await Status.findOne({
      name: inputs.statusName
    });
    if (conflictingStatus) {
      throw 'statusExists';
    }

    await Status.create({
      name: inputs.statusName,
      description: inputs.description,
      isClosedStatus: inputs.isClosedStatus,
      active: true //Active by default
    });

    return exits.success();

  }


};
