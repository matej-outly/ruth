(function($) {
	$.fn.slickExt = function(options) {

		return this.each(function() {
			var $this = $(this);

			var defaultOptions = {
				infinite: false,
				mobileFirst: true,
				prevArrow: '<button type="button" class="slick-prev"></button>',
				nextArrow: '<button type="button" class="slick-next"></button>',
			};

			var dataOptions = {};

			$.each($this.data(), function(key, value) {
				if (key.lastIndexOf("slides-", 0) !== 0) {
					return;
				}

				if (!dataOptions["responsive"]) {
					dataOptions.responsive = [];
				}

				dataOptions.responsive.push({
					breakpoint: key.substring(7), // Extract breakpoint value
					settings: {
						slidesToShow: value,
					}
				})
			});

			if ($this.data("slides") !== undefined) {
				dataOptions.slidesToShow = $this.data("slides");
			}

			var instanceOptions = $.extend({}, defaultOptions, options, dataOptions);
			$this.slick(instanceOptions);

		});

	}

}(jQuery));