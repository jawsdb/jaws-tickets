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

    let status = await Status.findOne({id: statusId});

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

    let ticket = await Ticket.findOne({id: ticketId})
    .populate('creator');

    //Address email to ticket requestor
    let recipients = [ticket.creator.emailAddress];

    //Add admins working on ticket to recipients list
    if (ticket.creator.id === this.req.me.id) {
      let responses = await Response.find({ticket: ticketId})
      .populate('creator');
      recipients = [];
      for (let i = 0; i < responses.length; i++) {
        if (responses[i].creator.isSuperAdmin && !recipients.includes(responses[i].creator.emailAddress)) {
          recipients.push(responses[i].creator.emailAddress);
        }
      }
      if (recipients.length === 0) { //No super admins working ticket yet
        let superAdmins = await User.find({
          isSuperAdmin: true
        });

        for (let i = 0; i < superAdmins.length; i++) {
          recipients.push(superAdmins[i].emailAddress);
        }
      }
    }

    let emailPromises = [];
    for (let i = 0; i < recipients.length; i++) {
      emailPromises.push(
        sails.helpers.sendTemplateEmail.with({
          to: recipients[i],
          subject: 'JawsDB - ('+ status.name +') New Ticket Response Created',
          template: 'email-response-created',
          templateData: {
            response: {
              ticket: ticket.id,
              body: inputs.body,
              creator: {
                emailAddress: this.req.me.emailAddress
              }
            }
          }
        })
      );
    }

    Promise.all(emailPromises)
      .then(resolutions => {
        //console.log(resolutions);
      })
      .catch(err => {
        console.log(err);
      });

    return exits.success({
      ticketId: ticketId
    });
  }


};
