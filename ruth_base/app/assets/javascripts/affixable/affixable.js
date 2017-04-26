/*****************************************************************************/
/* Copyright (c) Clockstar s.r.o. All rights reserved.                       */
/*****************************************************************************/
/*                                                                           */
/* Affixable - plugin for elemetn fixation inside its container              */
/*                                                                           */
/* Author: Matěj Outlý                                                       */
/* Date  : 25. 4. 2017                                                       */
/*                                                                           */
/*****************************************************************************/

$.fn.affixable = function(setOptions) {

	var options = $.extend({
		top: 0
	}, setOptions);

	this.each(function(index, element) {
		var $affixable = $(element);
		var $container = $affixable.closest('.affixable-container');
		var containerOffset = $container.offset().top;
		var containerHeight = $container.height();
		var affixableHeight = $affixable.height();

		$affixable.addClass('affixable');

		$(window).scroll(function() {
			var windowScroll = $(this).scrollTop();

			if (windowScroll + options.top < containerOffset) {
				$affixable.css('top', '0px');

			} else if (windowScroll + options.top < (containerOffset + containerHeight)) {
				var affixableTop = windowScroll + options.top - containerOffset;
				if (affixableTop + affixableHeight > containerHeight) {
					affixableTop = containerHeight - affixableHeight;
				}
				$affixable.css('top', affixableTop.toString() + 'px');
			
			} else {

			}
		});
	});
	
	return this;
}
