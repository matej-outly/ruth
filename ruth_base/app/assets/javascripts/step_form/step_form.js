/*****************************************************************************/
/* Copyright (c) Clockstar s.r.o. All rights reserved.                       */
/*****************************************************************************/
/*                                                                           */
/* StepForm - plugin for JavaScript step form handling                       */
/*                                                                           */
/* Author: Matěj Outlý                                                       */
/* Date  : 24. 1. 2018                                                       */
/*                                                                           */
/*****************************************************************************/

/*****************************************************************************/
/*
/* Options:
/* - validateUrl (string)    ... URL for step validation
/* - log (boolean)           ... Log success and error callbacks into console (for debugging purposes)
/* - checkStatus (boolean)   ... Check response status instead of ID for success (default is false because of backward compatibility)
/*
/*****************************************************************************/

(function ( $ ) {

	$.fn.stepForm = function(setOptions) {

		// Default options
		var options = $.extend({
			log: false,
			checkStatus: false,
		}, setOptions);

		// Constructor
		function StepForm(form, options)
		{
			self = this;

			// Basic configuration
			self.$form = $(form);
			self.options = (typeof options !== 'undefined' ? options : {});

			// Buttons
			self.$nextButton = self.$form.find(".form-navigation .next");
			self.$prevButton = self.$form.find(".form-navigation .prev");
			self.$submitButton = self.$form.find(".form-navigation [type='submit']");

			// Events
			self.$nextButton.click(function(e) {
				e.preventDefault();
				self.next();
			});
			self.$prevButton.click(function(e) {
				e.preventDefault();
				self.prev();
			});
			self.$submitButton.click(function(e) {
				e.preventDefault();
				self.validate(function() {
					self.$form.submit();
				});
			});

			// Counters
			if (self.options.current) {
				self.current = self.options.current;
			} else {
				self.current = self.$form.find('.form-step').first().data('step');
			}
			self.min = self.$form.find('.form-step').first().data('step');
			self.max = self.$form.find('.form-step').last().data('step');

			// Render
			self.renderSteps(false);
			self.renderNavigation(false);
		}

		// Form URL
		StepForm.prototype.url = function()
		{
			return this.options.validateUrl;
			//return this.$form.attr("action");
		}

		// Form ID
		StepForm.prototype.id = function()
		{
			return this.$form.attr("id");
		}

		// ********************************************************************
		// Clear
		// ********************************************************************

		StepForm.prototype.clearErrors = function()
		{
			this.$form.find(".errors").empty();
			this.$form.find(".has-error").removeClass("has-error");
		}

		// ********************************************************************
		// Submit logic
		// ********************************************************************

		StepForm.prototype.requestSuccess = function(id_or_data, block)
		{
			// No need to clear errors, because next step or submit continues
			//this.clearErrors();
			
			// All is OK, we can call the block
			block();
		}

		StepForm.prototype.requestError = function(callback, block)
		{
			// Clear previous errors
			this.clearErrors();
			
			// Select only fields in current step
			var $step = self.$form.find('.form-step[data-step=' + self.current + ']');
			var errorFound = false;

			// Set new error messages
			for (var field in callback) {
				var fieldId = self.$form.attr("id") + "_" + field + "_errors";
				var $field = $step.find("#" + fieldId);

				if ($field.length > 0) {
					errorFound = true;

					// Fill form with error messages
					var errors = callback[field];
					for (var i = 0; i < errors.length; ++i) {
						$field.append("<span class=\"help-block\">" + errors[i] + "</span>");
					}

					// Mark field as errorous
					$field.closest(".form-group").addClass("has-error")
				}
			}

			// If no error found in current step -> call the block
			if (!errorFound) {
				block();
			}
		}

		StepForm.prototype.validate = function(block)
		{
			var formParams = {};
			
			// URL
			var url = this.url();
			if (!url) {
				block();
				return;
			}

			// State change
			this.$form.addClass("form-sending-request");
			self.$nextButton.prop("disabled", true);
			this.$submitButton.prop("disabled", true);

			// Form data
			if (!this.options.uploadFile) {
				var formData = this.$form.serialize();
			} else {
				var formData = new FormData(this.$form[0]);
				formParams = $.extend({
					cache: false,
					contentType: false,
					processData: false,
				}, formParams);
			}

			// Core form params
			formParams = $.extend({
				url: url,
				dataType: "json",
				type: "POST",
				data: formData,

				// Success data fetch
				success: function(callback, status) {
					if (self.options.log) {
						console.log(callback);
						console.log(status);
					}

					// State change
					self.$form.removeClass("form-sending-request");
					self.$nextButton.prop("disabled", false);
					self.$submitButton.prop("disabled", false);

					// Callback
					var success = true;
					if (self.options.checkStatus != true) { // Check for ID
						success = ((callback ^ 0) === callback); // == Number.isInteger(callback) does not work in IE...
					}
					if (success) { 
						self.requestSuccess(callback, block);
					} else {
						self.requestError(callback, block);
					}
				},

				// Error data fetch
				error: function(callback, status) {
					if (self.options.log) {
						console.log(callback);
						console.log(status);
					}

					// State change
					self.$form.removeClass("form-sending-request");
					self.$nextButton.prop("disabled", false);
					self.$submitButton.prop("disabled", false);

					// Callback
					if (callback.responseJSON) {
						self.requestError(callback.responseJSON, block);
					} else {
						self.clearErrors();
					}
				},
			}, formParams);

			// Request
			$.ajax(formParams);
		}

		// ********************************************************************
		// Render
		// ********************************************************************

		StepForm.prototype.renderSteps = function(effect) 
		{
			var self = this;

			// Hide / show steps
			self.$form.find('.form-step').each(function() {
				var $step = $(this);
				if (parseInt($step.data('step')) == self.current) {
					$step.show();
				} else {
					$step.hide();
				}
			});

		}

		StepForm.prototype.renderNavigation = function(effect) 
		{
			var self = this;

			// Prev
			if (self.current <= self.min) {
				self.$prevButton.hide();
			} else {
				self.$prevButton.show();
			}

			// Next / submit
			if (self.current >= self.max) {
				self.$nextButton.hide();
				self.$submitButton.show();
			} else {
				self.$nextButton.show();
				self.$submitButton.hide();
			}
		}

		// ********************************************************************
		// Step handling
		// ********************************************************************

		StepForm.prototype.next = function()
		{
			var self = this;
			self.validate(function() {

				// Increment counter
				if (self.current < self.max) {
					self.current += 1;
				} else {
					self.current = self.max;
				}

				// Render
				self.renderSteps(true);
				self.renderNavigation(true);

			});
		}

		StepForm.prototype.prev = function()
		{
			var self = this;

			// Decrement counter
			if (self.current > self.min) {
				self.current -= 1;
			} else {
				self.current = self.min;
			}

			// Render
			self.renderSteps(true);
			self.renderNavigation(true);
		}

		// For each form here activate ajax request
		return this.each(function() {
			var stepForm = new StepForm(this, options);
		});
	};

}( jQuery ));

