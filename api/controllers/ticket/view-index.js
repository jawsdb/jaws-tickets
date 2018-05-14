const gravatar = require('gravatar');
const marked = require('marked');

marked.setOptions({
  sanitize: true,
  sanitizer: require('pagedown-sanitizer')
});

module.exports = {


  friendlyName: 'View index',


  description: 'Display "Index" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/ticket/index'
    },

    unauthorized: {
      statusCode: 401,
      viewTemplatePath: '401',
      description: 'Unauthorized',
      extendedDescription: 'User is not allowed to view this page',
    }

  },


  fn: async function (inputs, exits) {
    let ticketStatuses = Status.find();

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

    ticket.creator.gravatar = gravatar.url(ticket.creator.emailAddress, {s: '100', r: 'pg', d: 'mm'}, true);
    ticket.mdBody = marked(ticket.body);

    let responses = await Response.find({
      where: {ticket: ticketId},
      sort: 'id DESC'
    })
    .populate('creator')
    .populate('status');

    for (let i = 0; i < responses.length; i++) {
      responses[i].creator.gravatar = gravatar.url(responses[i].creator.emailAddress, {s: '100', r: 'pg', d: 'mm'}, true);
      responses[i].mdBody = marked(responses[i].body);
    }

    //TODO: remove sensitive info from ticket before sending to view

    ticket.status = (await Status.findOne({
      id: ticket.statushist[0].status
    })).name;

    if (!this.req.me.isSuperAdmin && this.req.me.id !== ticket.creator.id) {
      //throw 'unauthorized';
      return exits.unauthorized();
    }
    else {
      // Respond with view.
      return exits.success({
        ticket: ticket,
        responses: responses,
        statuses: await ticketStatuses
      });
    }

  }


};
