(function($){
	$.fn.croppable = function(setOptions) {

		var options = $.extend({
			aspectRatio: null,
			updated: null,
			initial: null,
			rounded: false,
		}, setOptions);

		/*
		if (options.rounded === true) {
			// Round crop needs aspect ratio 1
			options.aspectRatio = 1;
		}
		*/


		function ImageCropper(image)
		{
			this.$image = $(image);
			this.$container = null;
			this.$crop = null;

			this.startCoordinates = null;
			this.currentCoordinates = null;
			this.method = null;

		}
		ImageCropper.prototype = {
			constructor: ImageCropper,

			ready: function() {
				// Insert image into wrapper
				this.$image.wrap("<div class='croppable-container'></div>");
				this.$container = this.$image.parent();

				// Add class for image
				this.$image.addClass("croppable-image");

				// Add crop rectangle
				this.$container.append("<div class='croppable-crop'></div>");
				this.$crop = this.$container.find(".croppable-crop");

				// Init crop size
				this.initCrop();

				// Bind container events
				var self = this;
				// this.$container.mousedown(function(e) { self.onMouseDown(e); });
				this.$container.on("mousedown", this.onMouseDown.bind(this));
				$(document).on("mousemove", this.onMouseMove.bind(this));
				$(document).on("mouseup", this.onDeviceUp.bind(this));

				if (this.supportsTouchEvents()) {
					this.$container.on("touchstart", this.onTouchStart.bind(this));
					this.$container.on("touchmove", this.onTouchMove.bind(this));
					this.$container.on("touchend", this.onDeviceUp.bind(this));
				}
			},

			initCrop: function() {
				if (options.rounded === true) {
					this.$crop.addClass("croppable-rounded");
				}

				if (options.initial !== null) {
					var contentSize = this.getContentRealSize();
					this.setCropPositionAndSizeInPercents(
						options.initial.x / contentSize.width,
						options.initial.y / contentSize.height,
						options.initial.width / contentSize.width,
						options.initial.height / contentSize.height
					);
				}
			},

			onMouseDown: function(mouseEvent) {
				this.onDeviceDown(mouseEvent, this.getMouseCoordinates.bind(this));
			},

			onMouseMove: function(mouseEvent) {
				this.onDeviceMove(mouseEvent, this.getMouseCoordinates.bind(this));
			},

			onTouchStart: function(touchEvent) {
				this.onDeviceDown(touchEvent, this.getTouchCoordinates.bind(this));
			},

			onTouchMove: function(touchEvent) {
				this.onDeviceMove(touchEvent, this.getTouchCoordinates.bind(this));
			},

			onDeviceDown: function(event, coordinatesFunction) {
				if (this.method === null) {
					if (event.target === this.$crop[0]) {
						this.method = "moveCrop";
						this.startCoordinates = coordinatesFunction(event);

					} else {
						this.method = "createCrop";
						this.startCoordinates = coordinatesFunction(event);
					}
				}
			},

			onDeviceMove: function(event, coordinatesFunction) {
				if (this.method !== null) {
					this.currentCoordinates = coordinatesFunction(event);
					this.updateCrop();
				}
			},

			onDeviceUp: function() {
				this.method = null;
				this.startCoordinates = null;
				this.currentCoordinates = null;
			},


			signalUpdated: function() {
				if (options.updated !== null) {
					var crop = this.getCropCoordinates();

					options.updated({
						x: Math.round(crop.x),
						y: Math.round(crop.y),
						width: Math.round(crop.width),
						height: Math.round(crop.height)
					});
				}
			},

			//
			// Get coordinates always within container
			//
			getMouseCoordinates: function(mouseEvent) {
				var pageX = mouseEvent.pageX;
				var pageY = mouseEvent.pageY;
				return this._fixCoordinates(pageX, pageY);
			},

			//
			// Get coordinates from touch always within container
			//
			getTouchCoordinates: function(touchEvent) {
				var pageX = touchEvent.targetTouches[0].pageX;
				var pageY = touchEvent.targetTouches[0].pageY;
				return this._fixCoordinates(pageX, pageY);
			},

			//
			// Fix coordinates to be relative to container and within container
			//
			_fixCoordinates: function(pageX, pageY) {
				var offset = this.$container.offset();
				var width = this.$container.width();
				var height = this.$container.height();

				x = pageX - offset.left;
				y = pageY - offset.top;

				if (x < 0) { x = 0; }
				if (width < x) { x = width; }

				if (y < 0) { y = 0; }
				if (height < y) { y = height; }

				return { x: x, y: y }
			},

			//
			// Update crop rectangle position and size
			//
			updateCrop: function() {
				if (this.startCoordinates !== null && this.currentCoordinates !== null) {

					if (this.method === "createCrop") {
						this.fixCurrentCoordinatesByAspectRatio();

						var left = Math.min(this.startCoordinates.x, this.currentCoordinates.x);
						var top = Math.min(this.startCoordinates.y, this.currentCoordinates.y);
						var width = Math.max(this.startCoordinates.x, this.currentCoordinates.x) - left;
						var height = Math.max(this.startCoordinates.y, this.currentCoordinates.y) - top;

						this.setCropPositionAndSizeInPx(left, top, width, height);

					}
					else if (this.method === "moveCrop") {
						var moveX = this.currentCoordinates.x - this.startCoordinates.x;
						var moveY = this.currentCoordinates.y - this.startCoordinates.y;

						var position = this.$crop.position();
						var top = position.top;
						var left = position.left;
						var width = this.$crop.width();
						var height = this.$crop.height();

						var maxWidth = this.$container.width();
						var maxHeight = this.$container.height();

						if (maxWidth < left + moveX + width) { moveX = Math.max(0, maxWidth - left - width); }
						if (maxHeight < top + moveY + height) { moveY = Math.max(0, maxHeight - top - height); }
						if (left + moveX < 0) { moveX = -left; }
						if (top + moveY < 0) { moveY = -top; }

						this.setCropPositionAndSizeInPx(left + moveX, top + moveY);
						this.startCoordinates = this.currentCoordinates;
					}

					this.signalUpdated();
				}
			},

			//
			// Set crop rectangel position and size in px, which will be automatically recomputed into percents
			//
			setCropPositionAndSizeInPx(left, top, width, height) {
				var containerWidth = this.$container.width();
				var containerHeight = this.$container.height();

				left = left / containerWidth;
				top = top / containerHeight;

				if (width !== "undefined" && height !== "undefined") {
					this.setCropPositionAndSizeInPercents(left, top, width / containerWidth, height / containerHeight);
				}
				else {
					this.setCropPositionAndSizeInPercents(left, top);
				}
			},

			//
			// Set crop rectangle CSS position and size in percents (percents in [0.0, 1.0] interval)
			//
			setCropPositionAndSizeInPercents(left, top, width, height) {
				var cssProperties = {
					left: (left * 100) + "%",
					top: (top * 100) + "%",
				}
				if (width !== "undefined" && height !== "undefined") {
					cssProperties.width = (width * 100) + "%";
					cssProperties.height = (height * 100) + "%"
				}

				this.$crop.css(cssProperties);
			},

			//
			// Return real size of the content
			//
			getContentRealSize: function() {
				return {
					width: this.$image.prop("naturalWidth"),
					height: this.$image.prop("naturalHeight"),
				}
			},


			//
			// Return real coordinates (computed to picture size)
			//
			getCropCoordinates: function() {
				// Ratios should be same, if image is not deformed
				var contentSize = this.getContentRealSize();
				var ratioX = contentSize.width / this.$container.width();
				var ratioY = contentSize.height / this.$container.height();

				var position = this.$crop.position();
				return {
					x: position.left * ratioX,
					y: position.top * ratioY,
					width: this.$crop.width() * ratioX,
					height: this.$crop.height() * ratioY,
				}
			},

			fixCurrentCoordinatesByAspectRatio: function() {
				if (options.aspectRatio !== null && this.startCoordinates !== null && this.currentCoordinates !== null) {
					this._makeIdealCrop();
					this._checkCropBounds();
				}
			},

			_makeIdealCrop: function() {
				// Make ideal crop, do not check bounds
				var deltaX = this.currentCoordinates.x - this.startCoordinates.x;
				var deltaY = this.currentCoordinates.y - this.startCoordinates.y;

				var absDeltaX = Math.abs(deltaY) * options.aspectRatio;
				var aspectDeltaX = (0 < deltaX) ? absDeltaX : -absDeltaX;

				var absDeltaY = Math.abs(deltaX) / options.aspectRatio;
				var aspectDeltaY = (0 < deltaY) ? absDeltaY : -absDeltaY;

				var newX = this.startCoordinates.x + aspectDeltaX;
				var newY = this.startCoordinates.y + aspectDeltaY;

				if (Math.abs(deltaX) < Math.abs(deltaY)) {
					this.currentCoordinates.x = this.startCoordinates.x + aspectDeltaX;
				}
				else {
					this.currentCoordinates.y = this.startCoordinates.y + aspectDeltaY;
				}
			},

			_checkCropBounds: function() {
				var width = this.$container.width();
				if (this.currentCoordinates.x < 0) {
					var deltaX = -this.currentCoordinates.x;
					var deltaY = deltaX / options.aspectRatio;
					this.currentCoordinates.x = 0;
					this.currentCoordinates.y -= 0 < (this.currentCoordinates.y - this.startCoordinates.y) ? deltaY : -deltaY;
				}
				if (width < this.currentCoordinates.x) {
					var deltaX = width - this.currentCoordinates.x;
					var deltaY = deltaX / options.aspectRatio;
					this.currentCoordinates.x = width;
					this.currentCoordinates.y += 0 < (this.currentCoordinates.y - this.startCoordinates.y) ? deltaY : -deltaY;
				}

				var height = this.$container.height();
				if (this.currentCoordinates.y < 0) {
					var deltaY = -this.currentCoordinates.y;
					var deltaX = deltaY * options.aspectRatio;
					this.currentCoordinates.y = 0;
					this.currentCoordinates.x -= 0 < (this.currentCoordinates.x - this.startCoordinates.x) ? deltaX : -deltaX;
				}
				if (height < this.currentCoordinates.y) {
					var deltaY = height - this.currentCoordinates.y;
					var deltaX = deltaY * options.aspectRatio;
					this.currentCoordinates.y = height;
					this.currentCoordinates.x += 0 < (this.currentCoordinates.x - this.startCoordinates.x) ? deltaX : -deltaX;
				}
			},

			//
			// Detect if browser has touch events
			//
			supportsTouchEvents: function() {
				return ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
			}

		}

		return this.each(function() {
			var imageCropper = new ImageCropper(this);
			imageCropper.ready();
		});
	}
}(jQuery));