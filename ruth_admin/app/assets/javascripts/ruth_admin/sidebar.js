function sidebar_ready()
{
	$(".sidebar-toggle").click(function(e) {
		e.preventDefault();
		
		// Toggle class in DOM
		$("body").toggleClass("sidebar-active");

		// Is sidebar active?
		var sidebarActive = $("body").hasClass("sidebar-active");
		
		// Toggle flag in local storage
		localStorage.setItem('ruth_sidebar_active', sidebarActive);
	});

	// Load current state from storage
	var sidebarActiveByDefault = localStorage.getItem('ruth_sidebar_active');
	if (sidebarActiveByDefault == "false") {
		$("body").removeClass("sidebar-active");
	} else {
		$("body").addClass("sidebar-active");
	}

	// Scrollbar
	$(".sidebar-content").perfectScrollbar();

	// After some time set animated classes
	setTimeout(function() {
		$(".sidebar-right").addClass("animated");
		$(".sidebar-left").addClass("animated");
		$(".sidebar-container").addClass("animated");
	}, 500);
}

$(document).ready(sidebar_ready);
