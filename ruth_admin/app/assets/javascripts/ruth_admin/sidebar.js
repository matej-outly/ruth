function RuthSidebar(options)
{
	this.storageKey = 'ruth_sidebar';
	this.options = (typeof options !== 'undefined' ? options : {});
}
RuthSidebar.prototype = {
	constructor: RuthSidebar,
	saveScroll: function()
	{
		var scroll = $(".sidebar-content").scrollTop();
		localStorage.setItem(this.storageKey + '_scroll', scroll);
	},
	loadScroll: function()
	{
		var scroll = localStorage.getItem(this.storageKey + '_scroll');
		$(".sidebar-content").scrollTop(scroll);
	},
	reload: function()
	{
		this.loadScroll();
	},
	ready: function() 
	{
		var _this = this;

		// Active toggle
		$(".sidebar-toggle").click(function(e) {
			e.preventDefault();
			
			// Toggle class in DOM
			$("body").toggleClass("sidebar-active");

			// Is sidebar active?
			var sidebarActive = $("body").hasClass("sidebar-active");
			
			// Toggle flag in local storage
			localStorage.setItem(_this.storageKey + '_active', sidebarActive);
		});

		// Load current active state from storage
		var sidebarActiveByDefault = localStorage.getItem(_this.storageKey + '_active');
		if (sidebarActiveByDefault == "false") {
			$("body").removeClass("sidebar-active");
		} else {
			$("body").addClass("sidebar-active");
		}

		// After some time set animated classes
		setTimeout(function() {
			$(".sidebar-right").addClass("animated");
			$(".sidebar-left").addClass("animated");
			$(".sidebar-container").addClass("animated");
		}, 500);

		// Scrollbar
		$(".sidebar-content").perfectScrollbar();

		// Save scroll position to local storage
		$(".sidebar-content").scroll(this.saveScroll.bind(this));
	}
}

var ruth_sidebar = null;
$(document).ready(function() {
	ruth_sidebar = new RuthSidebar({});
	ruth_sidebar.ready();
});
