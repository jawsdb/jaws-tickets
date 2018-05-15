$(document).ready(() => {
  $(':button.toggle-active').click(async (e) => {
    //alert(e.target.value);
    let returnVal = await Cloud['toggleStatusActive'].with({
      statusId: e.target.value
    });
    console.log(returnVal);
    location.reload();
  });
});
