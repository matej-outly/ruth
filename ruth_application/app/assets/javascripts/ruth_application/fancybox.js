function fancybox_ready()
{
	$(".fancybox").fancybox({
		openEffect	: 'none',
		closeEffect	: 'none'
	});
}
$(document).on('<%= RuthApplication.use_turbolinks ? "turbolinks:load" : "ready" %>', fancybox_ready);
