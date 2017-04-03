/*****************************************************************************/
/* Copyright (c) Clockstar s.r.o. All rights reserved.                       */
/*****************************************************************************/
/*                                                                           */
/* Tile Resizer - jQuery plugin for making tiles same size                   */
/*                                                                           */
/* Author: Jaroslav Mlejnek                                                  */
/* Date  : 5. 3. 2017                                                        */
/*                                                                           */
/*****************************************************************************/

/******************************************************************************

Usage:

$(".tiles-selector").tileResizer({
	resize: '.title',
	bindToResizeEvent: true,
});

Example:
$(".products .product-item").tileResizer({
	resize: ['.title', '.description']
})

Description:

It resize this:
+--------+  +--------+  +--------+
| $#@*$# |  | @#$#@$ |  | (*@#&& |
| @$#@$# |  | _$#@@# |  | #@##$$ |
|        |  |        |  |        |
| Offer  |  | Super  |  | Offer2 |
|        |  | Offer  |  |        |
+--------+  |        |  +--------+
            +--------+

Into this:
+--------+  +--------+  +--------+
| $#@*$# |  | @#$#@$ |  | (*@#&& |
| @$#@$# |  | _$#@@# |  | #@##$$ |
|        |  |        |  |        |
| Offer  |  | Super  |  | Offer2 |
|        |  | Offer  |  |        |
|        |  |        |  |        |
+--------+  +--------+  +--------+


Options:
- resize (string or array) ... selectors of tile subelements, which will be 
                               used to make all tiles in one row same height
- bindToResizeEvent (boolean) ... whether to bind window resize event

******************************************************************************/

(function ( $ ) {

	$.fn.tileResizer = function(setOptions) {

		// Default options
		var options = $.extend({
			resize: '.title',
			bindToResizeEvent: true,
		}, setOptions);

		// Constructor
		function TileResizer(items, options) {
			this.$items = $(items);
			this.options = (typeof options !== 'undefined' ? options : {});

			// Resize must be array
			if ($.type(this.options.resize) == "string") {
				this.options.resize = [ this.options.resize ];
			}
		}

		// Divide items into lines
		TileResizer.prototype.itemsToLines = function($collection) {
			var lines = [];
			var line = null;
			var lastTop = null;
			$collection.each(function() {
				// Set automatic height
				var $item = $(this);

				// Decide if product item is on the same line or not
				var top = $item.offset().top;
				if (lastTop != top) {
					// Add new line
					line = [];
					lines.push(line);
				}

				// Insert item into line
				line.push($item);
				lastTop = top;
			});

			return lines;
		}

		TileResizer.prototype.setTilesSameHeight = function() {
			var self = this;

			// Clear heights
			this.$items.each(function() {
				var $item = $(this);
				for (var i = 0; i < self.options.resize.length; ++i) {
					var resizeSelector = self.options.resize[i];
					$item.find(resizeSelector).height("auto");
				}
			});

			// Split items into lines
			var lines = this.itemsToLines(this.$items);

			// Resize each line
			for (var i = 0; i < lines.length; ++i) {
				var line = lines[i];

				for (var j = 0; j < this.options.resize.length; ++j) {
					var resizeSelector = this.options.resize[j];

					// Get max height
					var maxHeight = Math.max.apply(Math,
						line.map(function($item) {
							return $item.find(resizeSelector).height();
						})
					);

					// Set height
					for (var k = 0; k < line.length; ++k) {
						var $item = line[k];

						$item.find(resizeSelector).height(maxHeight);
					}
				}
			}
		}


		// Resize & bind
		var tileResizer = new TileResizer(this, options);

		tileResizer.setTilesSameHeight();
		if (options.bindToResizeEvent) {
			$(window).resize(tileResizer.setTilesSameHeight.bind(tileResizer));
		}

		return this;
	};

}( jQuery ));
