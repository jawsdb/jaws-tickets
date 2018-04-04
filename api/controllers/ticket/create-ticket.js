module.exports = {


  friendlyName: 'Ticket',


  description: 'Ticket something.',


  inputs: {
    subject: {
      type: 'string',
      required: true,
      maxLength: 128,
      description: 'Subject line summary of ticket issue',
      example: "Life's not FAIR!!!"
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

    category: {
      type: 'string',
      required: true,
      description: 'The category object to associate with this ticket.'
    },
  },


  exits: {
    missingInputs: {
      statusCode: 400,
      description: 'Ticket is missing inputs'
    }

  },


  fn: async function (inputs, exits) {

    if (!inputs.subject || !inputs.body || !inputs.category || !inputs.status) {
      console.log(inputs);
      throw 'missingInputs';
    }

    let categoryId = isNaN(inputs.category) ? inputs.category : Number(inputs.category);
    let statusId = isNaN(inputs.status) ? inputs.status : Number(inputs.status);

    let newTicket = await Ticket.create({
      subject: inputs.subject,
      body: inputs.body,
      category: categoryId,
      creator: this.req.me.id
    }).fetch();

    await Ticketstatus.create({
      ticket: newTicket.id,
      status: statusId
    });

    return exits.success();

  }


};
