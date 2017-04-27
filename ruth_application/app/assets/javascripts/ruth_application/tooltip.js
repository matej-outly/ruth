function tooltip_ready()
{
	$('[data-toggle="tooltip"]').tooltip();
}
$(document).on('<%= RuthApplication.use_turbolinks ? "turbolinks:load" : "ready" %>', tooltip_ready);