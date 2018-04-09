module.exports = {


  friendlyName: 'View index',


  description: 'Display "Index" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/ticket/index'
    }

  },


  fn: async function (inputs, exits) {

    let ticketId = Number(this.req.params.id);
    let ticket = await Ticket.findOne({
      id: ticketId
    })
    .populate('category')
    .populate('creator')
    .populate('statushist', {
      sort: 'id DESC',
      limit: 1
    });

    let responses = await Response.find({
      where: {ticket: ticketId},
      sort: 'id DESC'
    })
    .populate('creator');

    //TODO: remove sensitive info from ticket before sending to view

    let status = await Status.findOne({
      id: ticket.statushist[0].status
    });

    sails.log.debug(ticket);

    // Respond with view.
    return exits.success({
      ticket: ticket,
      responses: responses,
      status: status
    });

  }


};
