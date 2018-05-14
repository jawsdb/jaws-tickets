module.exports = {


  friendlyName: 'View index',


  description: 'Display "Index" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/tickets/index'
    }

  },


  fn: async function (inputs, exits) {
    let queryCriteria = {};
    if (!this.req.me.isSuperAdmin) {
      queryCriteria.creator = this.req.me.id;
    }
    /*
    let tickets = await Ticket.find(queryCriteria)
      .populate('category')
      .populate('statushist', {
        sort: 'id DESC',
        limit: 1
      })
      .populate('creator');

    let statuses = await Status.find();
    let statusHash = {};
    for (let i = 0; i < statuses.length; i++) {
      // statusHash keys become strings for some reason
      statusHash[statuses[i].id] = statuses[i].name;
    }

    for (let i = 0; i < tickets.length; i++) {
      tickets[i].status = statusHash[String(tickets[i].statushist[0].status)];
    }
    */

    let ticketsQuery = `
      select
        t.id
        ,c.name category
        ,ts.status statusId
        ,s.name status
        ,t.subject
        ,t.body
        ,u.emailAddress creator
        ,t.createdAt
        ,t.updatedAt
      from
        ticket t
        inner join
        user u on t.creator = u.id
        inner join
        category c on t.category = c.id
        inner join
        (
          select
            tsi.ticket
            ,cast(
              substring_index(
                group_concat(tsi.status order by tsi.id desc)
                ,','
                ,1
              ) as unsigned
            ) status
          from
            ticketstatus tsi
          group by
            tsi.ticket
        ) ts on t.id = ts.ticket
        inner join
        status s on ts.status = s.id
      where
        $1 in (
          select t.creator
          union all
          select sa.id
          from user sa -- super admins
          where
            sa.isSuperAdmin = 1
        )
      order by
        case s.name
          when 'Open' then 1
          when 'Closed' then 999
          else 2
        end
        ,case s.name
          when 'Closed' then 0 - t.id
          else t.id
        end -- Open tickets (oldest to newest) closed tickets (newest to oldest)
    `;

    let tickets = (await sails.sendNativeQuery(ticketsQuery, [this.req.me.id])).rows;

    // Respond with view.
    return exits.success({
      tickets: tickets
    });

  }


};
