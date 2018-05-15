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

    let status = await Status.findOne(inputs.statusId);

    await Status.update({
      id: inputs.statusId
    })
    .set({
      active: !status.active
    });

    return exits.success();

  }


};
