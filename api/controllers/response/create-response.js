module.exports = {


  friendlyName: 'Response',


  description: 'Response something.',


  inputs: {

    ticketId: {
      type: 'string',
      required: true,
      description: 'Primary key value of ticket that this response is for.'
    },

    body: {
      type: 'string',
      required: true,
      maxLength: 16383, //MySQL Text field limit divided by 4 bytes per character
      description: 'Detailed description of issue'
    },

    status: {
      type: 'string',
      required: true,
      description: 'The status object to associate via Ticketstatus model'
    },
  },


  exits: {
    missingInputs: {
      statusCode: 400,
      description: 'Response is missing inputs'
    },

    redirect: {//why can't i redirect here?
      description: 'The response has been created. Directing to ticket page.',
      responseType: 'redirect'
    }

  },


  fn: async function (inputs, exits) {

    if (!inputs.ticketId || !inputs.body || !inputs.status) {
      console.log(inputs);
      throw 'missingInputs';
    }

    let ticketId = isNaN(inputs.ticketId) ? inputs.ticketId : Number(inputs.ticketId);
    let statusId = isNaN(inputs.status) ? inputs.status : Number(inputs.status);

    await Ticketstatus.create({
      ticket: ticketId,
      status: statusId
    });

    await Response.create({
      body: inputs.body,
      ticket: ticketId,
      creator: this.req.me.id,
      status: statusId
    });

    return exits.success({
      ticketId: ticketId
    });
  }


};
