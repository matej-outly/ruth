function ticket_ready()
{
	$(".ticket").tileResizer({
		resize: ['.ticket-heading', '.ticket-body'],
	});
}
$(document).ready(ticket_ready);
