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
        and s.isClosedStatus = 0 -- Don't show closed tickets here
      order by
        t.id -- Oldest to newest
    `;

    let tickets = (await sails.sendNativeQuery(ticketsQuery, [this.req.me.id])).rows;

    // Respond with view.
    return exits.success({
      tickets: tickets
    });

  }


};
