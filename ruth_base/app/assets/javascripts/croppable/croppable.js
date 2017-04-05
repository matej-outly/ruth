(function($){
	$.fn.croppable = function(setOptions) {

		var options = $.extend({
			aspectRatio: null, // Image aspect ratio
			initial: null, // Initial in real px
			rounded: false, // Should be selection rounded? Just effect.
			cropUpdated: null, // Callback when selection changed
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
			this.cropElement = null;

			this.$east = null;
			this.eastElement = null;
			this.$south = null;
			this.southElement = null;
			this.$west = null;
			this.westElement = null;
			this.$north = null;
			this.northElement = null;

			this.startCoordinates = null;
			this.currentCoordinates = null;
			this.fixedCoordinates = { x: null, y: null };
			this.method = null;

			// For special case after initialization
			this._replaceMoveByCreateAction = false;

		}
		ImageCropper.prototype = {
			constructor: ImageCropper,

			ready: function() {
				// Crate markup
				this.createCrop();

				// Initialize values
				this.initCrop();

				// Bind events
				this.$container.on("mousedown", this.onMouseDown.bind(this));
				$(document).on("mousemove", this.onMouseMove.bind(this));
				$(document).on("mouseup", this.onDeviceUp.bind(this));

				if (this.supportsTouchEvents()) {
					this.$container.on("touchstart", this.onTouchStart.bind(this));
					this.$container.on("touchmove", this.onTouchMove.bind(this));
					this.$container.on("touchend", this.onDeviceUp.bind(this));
				}
			},

			//
			// Create elements
			//
			createCrop: function() {
				// Insert image into wrapper
				this.$image.wrap("<div class='croppable-container'></div>");
				this.$container = this.$image.parent();

				// Add class for image
				this.$image.addClass("croppable-image");

				// Add crop rectangle
				this.$container.append("<div class='croppable-crop'></div>");
				this.$crop = this.$container.find(".croppable-crop");
				this.cropElement = this.$crop[0];

				// Add resize borders
				this.$crop.append("<div class='croppable-crop-east'></div>");
				this.$east = this.$crop.find(".croppable-crop-east");
				this.eastElement = this.$east[0];

				this.$crop.append("<div class='croppable-crop-south'></div>");
				this.$south = this.$crop.find(".croppable-crop-south");
				this.southElement = this.$south[0];

				this.$crop.append("<div class='croppable-crop-west'></div>");
				this.$west = this.$crop.find(".croppable-crop-west");
				this.westElement = this.$west[0];

				this.$crop.append("<div class='croppable-crop-north'></div>");
				this.$north = this.$crop.find(".croppable-crop-north");
				this.northElement = this.$north[0];
			},

			//
			// Initialize values
			//
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
					this.signalCropUpdated();
				}
				else if (options.aspectRatio !== null) {
					// Set up crop to be centered by aspect ratio
					var maxWidth = this.$container.width();
					var maxHeight = this.$container.height();

					var width = maxHeight * options.aspectRatio;
					var height = maxWidth / options.aspectRatio;

					if (maxWidth < width) {
						width = height * options.aspectRatio;
					}
					if (maxHeight < height) {
						height = width * options.aspectRatio;
					}

					var deltaX = maxWidth - width;
					var deltaY = maxHeight - height;

					this.setCropPositionAndSizeInPx(deltaX / 2, deltaY / 2, width, height);
					this.setReplaceMoveByCreateAction(true);
					this.signalCropUpdated();
				}
				else {
					this.setCropPositionAndSizeInPercents(0, 0, 1, 1);
					this.setReplaceMoveByCreateAction(true);
					this.signalCropUpdated();
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
					event.preventDefault();

					switch (event.target) {
					case this.eastElement:
						this.method = "resizeCrop";
						var position = this.$crop.position();
						this.startCoordinates = { x: position.left, y: position.top }
						this.fixedCoordinates = { x: null, y: position.top + this.$crop.height() }
						break;

					case this.southElement:
						this.method = "resizeCrop";
						var position = this.$crop.position();
						this.startCoordinates = { x: position.left, y: position.top }
						this.fixedCoordinates = { x: position.left + this.$crop.width(), y: null }
						break;

					case this.westElement:
						this.method = "resizeCrop";
						var position = this.$crop.position();
						this.startCoordinates = { x: position.left + this.$crop.width(), y: position.top }
						this.fixedCoordinates = { x: null, y: position.top + this.$crop.height() }
						break;

					case this.northElement:
						this.method = "resizeCrop";
						var position = this.$crop.position();
						this.startCoordinates = { x: position.left, y: position.top + this.$crop.height() }
						this.fixedCoordinates = { x: position.left + this.$crop.width(), y: null }
						break;

					case this.cropElement:
						if (!this.getReplaceMoveByCreateAction()) {
							this.method = "moveCrop";
							this.startCoordinates = coordinatesFunction(event);
							break;
						}
						else {
							this.setReplaceMoveByCreateAction(false);
							// no break
						}

					default: // must follow after cropElement case
						this.method = "createCrop";
						this.startCoordinates = coordinatesFunction(event);
					}
				}
			},

			onDeviceMove: function(event, coordinatesFunction) {
				if (this.method !== null) {
					event.preventDefault();
					this.currentCoordinates = coordinatesFunction(event);
					this.updateCrop();
				}
			},

			onDeviceUp: function() {
				this.method = null;
				this.startCoordinates = null;
				this.currentCoordinates = null;
				this.fixedCoordinates = { x: null, y: null };
			},


			signalCropUpdated: function() {
				if (options.cropUpdated !== null) {
					var crop = this.getCropCoordinates();

					options.cropUpdated({
						x: Math.round(crop.x),
						y: Math.round(crop.y),
						width: Math.round(crop.width),
						height: Math.round(crop.height)
					});
				}
			},

			//
			// Set up move replacement by update action
			//
			setReplaceMoveByCreateAction: function(enabled) {
				if (enabled) {
					this._replaceMoveByCreateAction = true;
					this.$crop.addClass("croppable-crop-create");
				}
				else {
					this._replaceMoveByCreateAction = false;
					this.$crop.removeClass("croppable-crop-create");
				}
			},

			//
			// Get state of replacement by update acton
			//
			getReplaceMoveByCreateAction: function() {
				return this._replaceMoveByCreateAction;
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
				var pageX = touchEvent.originalEvent.targetTouches[0].pageX;
				var pageY = touchEvent.originalEvent.targetTouches[0].pageY;
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

					switch (this.method) {
					case "resizeCrop":
						if (this.fixedCoordinates.x !== null) {
							this.currentCoordinates.x = this.fixedCoordinates.x;
						}
						if (this.fixedCoordinates.y !== null) {
							this.currentCoordinates.y = this.fixedCoordinates.y;
						}

						// no break

					case "createCrop":
						this.fixCurrentCoordinatesByAspectRatio();

						var left = Math.min(this.startCoordinates.x, this.currentCoordinates.x);
						var top = Math.min(this.startCoordinates.y, this.currentCoordinates.y);
						var width = Math.max(this.startCoordinates.x, this.currentCoordinates.x) - left;
						var height = Math.max(this.startCoordinates.y, this.currentCoordinates.y) - top;

						this.setCropPositionAndSizeInPx(left, top, width, height);
						break;

					case "moveCrop":
						var state = this._getCurrentState();

						if (state.maxWidth < state.left + state.moveX + state.width) { state.moveX = state.maxWidth - state.left - state.width; }
						if (state.maxHeight < state.top + state.moveY + state.height) { state.moveY = state.maxHeight - state.top - state.height; }
						if (state.left + state.moveX < 0) { state.moveX = -state.left; }
						if (state.top + state.moveY < 0) { state.moveY = -state.top; }

						this.setCropPositionAndSizeInPx(state.left + state.moveX, state.top + state.moveY, null, null);
						this.startCoordinates = this.currentCoordinates;
						break;
					}

					this.signalCropUpdated();
				}
			},

			//
			// Get current state for update
			//
			_getCurrentState: function() {
				var position = this.$crop.position();

				return {
					moveX: this.currentCoordinates.x - this.startCoordinates.x,
					moveY: this.currentCoordinates.y - this.startCoordinates.y,
					top: position.top,
					left: position.left,
					width: this.$crop.width(),
					height: this.$crop.height(),
					maxWidth: this.$container.width(),
					maxHeight: this.$container.height(),
				}
			},

			//
			// Set crop rectangle position and size in px, which will be automatically recomputed into percents
			//
			setCropPositionAndSizeInPx(left, top, width, height) {
				var containerWidth = this.$container.width();
				var containerHeight = this.$container.height();

				if (left !== null) {
					left = left / containerWidth;
				}
				if (top !== null) {
					top = top / containerHeight;
				}
				if (width !== null) {
					width = width / containerWidth;
				}
				if (height !== null) {
					height = height / containerHeight;
				}

				this.setCropPositionAndSizeInPercents(left, top, width, height);
			},

			//
			// Set crop rectangle CSS position and size in percents (percents in [0.0, 1.0] interval)
			//
			setCropPositionAndSizeInPercents(left, top, width, height) {
				var cssProperties = {};

				if (left !== null) {
					cssProperties.left = (left * 100) + "%";
				}
				if (top !== null) {
					cssProperties.top = (top * 100) + "%";
				}
				if (width !== null) {
					cssProperties.width = (width * 100) + "%";
				}
				if (height !== null) {
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

				//

				var absDeltaX = Math.abs(deltaY) * options.aspectRatio;
				var aspectDeltaX = (0 < deltaX) ? absDeltaX : -absDeltaX;

				var absDeltaY = Math.abs(deltaX) / options.aspectRatio;
				var aspectDeltaY = (0 < deltaY) ? absDeltaY : -absDeltaY;

				var newX = this.startCoordinates.x + aspectDeltaX;
				var newY = this.startCoordinates.y + aspectDeltaY;

				if (this.fixedCoordinates.y === null || (this.fixedCoordinates.x !== null && Math.abs(deltaX) < Math.abs(deltaY))) {
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