module.exports = {


  friendlyName: 'Disable status',


  description: '',


  inputs: {
    statusId: {
      type: 'number',
      required: true,
      description: 'The primary key of the status to disable.'
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {

    await Status.update({
      id: inputs.statusId
    })
    .set({
      active: false
    });

    return exits.success();

  }


};
