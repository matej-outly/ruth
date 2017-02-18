/*****************************************************************************/
/* Copyright (c) Clockstar s.r.o. All rights reserved.                       */
/*****************************************************************************/
/*                                                                           */
/* AjaxForm - plugin for form handling via Ajax (submit, messages)           */
/*                                                                           */
/* Author: Jaroslav Mlejnek                                                  */
/* Date  : 20. 2. 2017                                                       */
/*                                                                           */
/*****************************************************************************/

/******************************************************************************

Options (to be implemented):

- flashSelector (string) .... Selector for inline flash container, if not 
                              provided, Alertify plugin 
- successMessage (string) ... Message displayed at success
- errorMessage (string) ..... Message displayed at error
- clearOnSubmit (boolean) ... Clear form values when successfuly submitted?
- behaviorOnSubmit (none|hide|redirect) ... What to do when form is successfuly
                                            submitted
- hideTimeout (integer) ..... How many seconds to wait until hidden form is 
                              shown again, hide forever if null (only for 'hide' 
                              behavior)
- redirectUrl (string) ...... URL where to redirect when form is successfuly 
                              submitted (only for 'hide' behavior)

Coresponding options set via data attribute:

- data-af-flash-selector
- data-af-success-message
- data-af-error-message
- data-af-clear-on-submit
- data-af-behavior-on-submit
- data-af-hide-timeout
- data-af-redirect-url

******************************************************************************/

(function ( $ ) {

	$.fn.ajaxForm = function(setOptions) {

		// Default options
		var options = $.extend({
			flashSelector: null,
			successMessage: "Record has been successfully saved.",
			errorMessage: "Record has not been saved, please check form for errors.",
			clearOnSubmit: true,
			behaviorOnSubmit: "none",
			hideTimeout: 5,
			redirectUrl: null
		}, setOptions);

		// Constructor
		function AjaxForm(form, options) {
			this.$form = $(form);
			this.options = (typeof options !== 'undefined' ? options : {});

			// Override options with data attributes if defined
			var overrideOptions = {
				flashSelector: this.$form.attr("data-af-flash-selector"),
				successMessage: this.$form.attr("data-af-success-message"),
				errorMessage: this.$form.attr("data-af-error-message"),
				clearOnSubmit: (this.$form.attr("data-af-clear-on-submit") ? (this.$form.attr("data-af-clear-on-submit") == "true") : undefined),
				behaviorOnSubmit: this.$form.attr("data-af-behavior-on-submit"),
				hideTimeout: (this.$form.attr("data-af-hide-timeout") ? parseInt(this.$form.attr("data-af-hide-timeout")) : undefined),
				redirectUrl: this.$form.attr("data-af-redirect-url")
			};
			for (var key in this.options) {
				if (overrideOptions[key]) {
					this.options[key] = overrideOptions[key];
				}
			}
		}

		// Form URL
		AjaxForm.prototype.url = function() {
			return this.$form.attr("action");
		}

		// Form ID
		AjaxForm.prototype.id = function() {
			return this.$form.attr("id");
		}

		// Set flash message on success or error
		AjaxForm.prototype.setFlashMessage = function(result) {
			
			// Set message to flash selector
			if (this.options.flashSelector) {
				var $flash = $(this.options.flashSelector);
				var message = result ? this.options.successMessage : this.options.errorMessage;
				$flash.val(message);
			
			// Set message to alertify
			} else if (typeof alertify != 'undefined') {
				if (result) {
					alertify.success(this.options.successMessage);
				} else {
					alertify.error(this.options.errorMessage);
				}
			}
		}

		AjaxForm.prototype.behaveOnSubmit = function() {
			var self = this;

			// Hide and (optionaly) show
			if (this.options.behaviorOnSubmit == "hide") {
				$formContainer = this.$form.find(".af-container")
				$formContainer.addClass("af-hidden")
				if (this.options.hideTimeout) {
					setTimeout(function() {
						self.clearForm();
						$formContainer.removeClass("af-hidden");
					}, this.options.hideTimeout * 1000);
				}

			// Redirect
			} else if (this.options.behaviorOnSubmit == "redirect") {
				self.clearForm();
				// TODO
			
			// Nothing
			} else {
				self.clearForm();
			}
		}

		AjaxForm.prototype.clearErrors = function()
		{
			this.$form.find(".errors").empty();
			this.$form.find(".has-error").removeClass("has-error");
		}

		AjaxForm.prototype.clearForm = function()
		{
			this.clearErrors();
			this.clearRecaptcha();
			if (this.options.clearOnSubmit) {
				this.$form.find(".form-control").val("");
			}
		}

		AjaxForm.prototype.clearRecaptcha = function()
		{
			if (typeof grecaptcha != "undefined" && this.$form.find(".g-recaptcha")) {
				grecaptcha.reset();
			}
		}

		AjaxForm.prototype.requestSuccess = function(callback)
		{
			// Everything is OK
			this.setFlashMessage(true);
			this.behaveOnSubmit();
		}

		AjaxForm.prototype.requestError = function(callback)
		{
			// Something is bad
			this.setFlashMessage(false);
			this.clearErrors();
			this.clearRecaptcha();

			// Set error messages
			for (var field in callback) {
				var fieldId = this.id() + "_" + field + "_errors";
				var $field = $("#" + fieldId);

				// Fill form with error messages
				var errors = callback[field];
				for (var i = 0; i < errors.length; ++i) {
					$field.append("<span class=\"help-block\">" + errors[i] + "</span>");
				}

				// Mark field as errorous
				$field.closest(".form-group").addClass("has-error")
			}
		}

		AjaxForm.prototype.ajaxSuccess = function(callback)
		{
			if (Number.isInteger(callback)) {
				this.requestSuccess(callback);
			} else {
				this.requestError(callback);
			}
		}

		AjaxForm.prototype.ajaxError = function(callback)
		{
			// Something is bad, and we don't know what
			// There should be third state of flash messge with parameter "null".
			this.setFlashMessage(false);
			this.clearErrors();
			this.clearRecaptcha();
		}

		AjaxForm.prototype.activateAjax = function()
		{
			var self = this;
			var $submitButton = this.$form.find("[type='submit']");

			$submitButton.click(function(e) {
				e.preventDefault();

				// URL
				var url = self.url();

				self.$form.addClass("af-sending-request");
				$submitButton.prop("disabled", true);

				// Request
				$.ajax({
					url: url,
					dataType: "json",
					type: "POST",
					data: self.$form.serialize(),

					// Success data fetch
					success: function(callback) { self.$form.removeClass("af-sending-request"); $submitButton.prop("disabled", false); self.ajaxSuccess(callback); },

					// Error data fetch
					error: function(callback) { self.$form.removeClass("af-sending-request"); $submitButton.prop("disabled", false); self.ajaxError(callback); },
				});
			});
		}

		// For each form here activate ajax request
		return this.each(function() {
			var ajaxForm = new AjaxForm(this, options);
			ajaxForm.activateAjax();
		});
	};

}( jQuery ));

