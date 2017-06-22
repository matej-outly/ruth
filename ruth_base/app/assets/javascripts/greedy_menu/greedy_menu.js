var greedyMenu = null;

(function($) {

	function GreedyMenu($container, options) {
		this.$container = $container;
		this.$fixeds = this.$container.find(".nav-greedy-fixed");
		this.$visibleLinks = this.$container.find(".nav-greedy-nav");
		this.$hiddenLinks = this.$container.find(".nav-greedy-overflow");
		this.$counter = this.$container.find(".nav-greedy-counter");
		this.$hamburger = this.$container.find(".nav-greedy-hamburger");
		this.$hamburgerButton = this.$container.find(".nav-greedy-hamburger-button");
		this.$mobileHamburgerButton = this.$container.find(".nav-mobile-hamburger-button");
		this.$window = $(window);

		this.options = {
			widthCorrection: 1.00, // Plus 5% just in case the font is not loaded
			hamburgerWidth: 70, // Hamburger icon width in px
			mobileBreakpoint: 767, //991, // Breakpoint, where menu becomes mobile
		};

		this.availableSpace = 0;
		this.itemsCount = 0;
		this.breakWidths = [];

		this.visibleItemsCount = 0;

		this.currentMenuStyle = null; // "greedy" or "mobile", null for uninitialized menu

	}
	GreedyMenu.prototype = {
		constructor: GreedyMenu,

		initGreedyMenu: function() {
			var self = this;

			// Main menu must be visible
			if (!this.$visibleLinks.is(":visible")) {
				this.$visibleLinks.show();
			}

			// Hide greedy overflow
			this.$hiddenLinks.hide();
			this.$hamburger.removeClass("active");

			// Clear overflow menu
			this.$hiddenLinks.children().each(function() {
				$(this).appendTo(self.$visibleLinks);
			});

			// Initial values
			this.itemsCount = 0;
			this.breakWidths = [];

			// Compute
			var totalSpace = 0;
			this.$visibleLinks.children().outerWidth(function(index, width) {
				totalSpace += Math.ceil(width * self.options.widthCorrection);
				self.itemsCount += 1;
				self.breakWidths.push(totalSpace);
			});

			// Add class to inform about current menu style
			this.$container.addClass("nav-greedy-greedy");
			this.$container.removeClass("nav-greedy-mobile");
		},

		initMobileMenu: function() {
			// Clear overflow menu
			var self = this;
			this.$hiddenLinks.children().each(function() {
				$(this).appendTo(self.$visibleLinks);
			});

			// Hide menu
			this.$mobileHamburgerButton.removeClass("active");
			this.$visibleLinks.hide();

			// Add class to inform about current menu style
			this.$container.removeClass("nav-greedy-greedy");
			this.$container.addClass("nav-greedy-mobile");
		},

		updateGreedyState: function() {
			// Number of visible items
			this.visibleItemsCount = this.$visibleLinks.children().length;

			// Total width
			var totalWidth = Math.floor(this.$container.innerWidth());

			// Minus fixed containers
			this.$fixeds.each(function() {
				totalWidth -= Math.ceil($(this).outerWidth());
			});

			// Minus hamburger, if shown
			// if (1 < this.itemsCount - this.visibleItemsCount) {
				totalWidth -= this.options.hamburgerWidth;
			// }

			this.availableSpace = totalWidth;
		},

		updateGreedyHamburger: function(hiddenItemsCount) {
			this.$counter.text(hiddenItemsCount);
		},

		isMobile: function() {
			var windowWidth = window.innerWidth || this.$window.width();
			return Math.floor(windowWidth) < this.options.mobileBreakpoint;
		},

		rearrangeGreedyMenu: function() {
			// Update available space
			this.updateGreedyState();

			var requiredSpace = this.breakWidths[this.visibleItemsCount - 1];

			if (requiredSpace > this.availableSpace) {
				// There is not enough space
				this.$visibleLinks.children().last().prependTo(this.$hiddenLinks);
				this.rearrange();
			}
			else if (this.availableSpace > this.breakWidths[this.visibleItemsCount]) {
				// There is more than needed space
				this.$hiddenLinks.children().first().appendTo(this.$visibleLinks);
				this.rearrange();
			}

			// Update the button accordingly
			this.updateGreedyHamburger(this.itemsCount - this.visibleItemsCount);

			if (this.visibleItemsCount === this.itemsCount) {
				// All items are visible.
				this.$container.removeClass('collapsed');
			}
			else {
				// Some of items are collapsed.
				this.$container.addClass('collapsed');
			}
		},

		rearrangeMobileMenu: function() {

		},

		rearrange: function() {
			if (this.isMobile()) {
				if (this.currentMenuStyle !== "mobile") {
					this.initMobileMenu();
					this.currentMenuStyle = "mobile";
				}

				this.rearrangeMobileMenu();
			}
			else {
				if (this.currentMenuStyle !== "greedy") {
					this.initGreedyMenu();
					this.currentMenuStyle = "greedy";
				}

				this.rearrangeGreedyMenu();
			}
		},

		ready: function() {
			// Initialize rearranging
			var self = this;
			this.$window.resize(function() {
				self.rearrange();
			});

			this.rearrange();
			this.$container.addClass("initialized");

			// Initialize events
			this.$hamburgerButton.click(function() {
				var removeActive = null;
				if (self.$hiddenLinks.is(":visible")) {
					removeActive = function() {
						self.$hamburger.removeClass("active");
					}
				}
				else {
					self.$hamburger.addClass("active");
				}
				self.$hiddenLinks.slideToggle(removeActive);
			});

			this.$mobileHamburgerButton.click(function() {
				if (self.$visibleLinks.is(":visible")) {
					self.$visibleLinks.slideUp(function() {
						self.$mobileHamburgerButton.removeClass("active");
					})
				}
				else {
					self.$mobileHamburgerButton.addClass("active");
					self.$visibleLinks.slideDown();
				}

			});

		},

	};

	function initGreedyMenu() {
		if (greedyMenu === null) {
			greedyMenu = new GreedyMenu($(".nav-greedy-container"), {});
			greedyMenu.ready();
		}
		else {
			// Completelly rearrange
			greedyMenu.currentMenuStyle = null;
			greedyMenu.rearrange();
		}
	}

	$(document).ready(initGreedyMenu);
	$(window).bind("load", initGreedyMenu);

})(jQuery);