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

/*****************************************************************************/
/*
/* Options:
/* - flashSelector (string) .... Selector for inline flash container, if not
/*                               provided, Alertify plugin used
/* - successMessage (string) ... Message displayed at success
/* - errorMessage (string) ..... Message displayed at error
/* - clearOnSubmit (boolean) ... Clear form values when successfuly submitted?
/* - behaviorOnSubmit (none|hide|redirect) ... What to do when form is
/*                               successfuly submitted
/* - hideTimeout (integer) ..... How many seconds to wait until hidden form is
/*                               shown again, hide forever if null (only for
/*                               'hide' behavior)
/* - copyToObject (string) ..... JS object implementing addItem() and
/*                               changeItem()  functions where submitted data
/*                               will be copied
/* - redirectUrl (string) ...... URL where to redirect when form is successfuly
/*                               submitted (necessary for 'hide' behavior)
/* - showUrl (string) .......... URL where edited object can be loaded through
/*                               AJAX (necessary if copyToObject defined)
/* - invisibleRecaptcha (boolean) ...  Use invisible recaptcha? Default - autodetect
/* - logCallback (boolean) ..... Log success and error callbacks into console
/*                               (for debugging purposes)
/*
/* Coresponding options set via data attribute:
/* - data-af-flash-selector
/* - data-af-success-message
/* - data-af-error-message
/* - data-af-clear-on-submit
/* - data-af-behavior-on-submit
/* - data-af-hide-timeout
/* - data-af-copy-to-object
/* - data-af-redirect-url
/* - data-af-show-url
/* - data-af-invisible-recaptcha
/* - data-af-log-callback
/*
/*****************************************************************************/

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
			copyToObject: null,
			redirectUrl: null,
			showUrl: null,
			invisibleRecaptcha: null, // null means auto-detect
			logCallback: false,
		}, setOptions);

		// Constructor
		function AjaxForm(form, options)
		{
			// Basic configuration
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
				copyToObject: this.$form.attr("data-af-copy-to-object"),
				redirectUrl: this.$form.attr("data-af-redirect-url"),
				showUrl: this.$form.attr("data-af-show-url"),
				invisibleRecaptcha: (this.$form.attr("data-af-invisible-recaptcha") ? (this.$form.attr("data-af-invisible-recaptcha") == "true") : undefined),
				logCallback: (this.$form.attr("data-af-log-callback") ? (this.$form.attr("data-af-log-callback") == "true") : undefined),
			};
			for (var key in this.options) {
				if (typeof overrideOptions[key] !== 'undefined') {
					this.options[key] = overrideOptions[key];
				}
			}

			// Advanced configuration
			this.$submitButton = this.$form.find("[type='submit']");
			this.$recaptchaSubmitButton = this.$form.find("button.g-recaptcha");
			this.invisibleRecaptchaId = "onInvisibleRecaptchaFormSubmit_" + this.id();

			if (options.invisibleRecaptcha === null) {
				// Autodetect invisible recaptcha by recaptcha id
				options.invisibleRecaptcha = (this.$recaptchaSubmitButton.length !== 0);
			}
		}

		// Form URL
		AjaxForm.prototype.url = function()
		{
			return this.$form.attr("action");
		}

		// Form ID
		AjaxForm.prototype.id = function()
		{
			return this.$form.attr("id");
		}

		// Set flash message on success or error
		AjaxForm.prototype.setFlashMessage = function(result)
		{

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

		AjaxForm.prototype.behaveOnSubmit = function()
		{
			var self = this;

			// Hide and (optionaly) show
			if (this.options.behaviorOnSubmit == "hide") {
				$formContainer = this.$form.find(".af-container");
				if ($formContainer.length == 0) {
					$formContainer = this.$form;
				}
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

		AjaxForm.prototype.copyToObject = function(id)
		{
			var self = this;

			if (self.options.copyToObject && self.options.showUrl) {
				var showUrl = self.options.showUrl.replace(':id', id);
				$.get(showUrl, function(data) {
					eval('var copyToObject = ' + self.options.copyToObject + ';');
					copyToObject.changeItem(id, data);
				});
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

		AjaxForm.prototype.requestSuccess = function(id)
		{
			// Everything is OK
			this.setFlashMessage(true);
			this.behaveOnSubmit();
			this.copyToObject(id);
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

		AjaxForm.prototype.submitForm = function()
		{
			// URL
			var url = this.url();

			this.$form.addClass("af-sending-request");
			this.$submitButton.prop("disabled", true);

			// Request
			var self = this;
			$.ajax({
				url: url,
				dataType: "json",
				type: "POST",
				data: this.$form.serialize(),

				// Success data fetch
				success: function(callback) {
					if (options.logCallback) {
						console.log(callback);
					}

					self.$form.removeClass("af-sending-request");
					self.$submitButton.prop("disabled", false);
					self.ajaxSuccess(callback);
				},

				// Error data fetch
				error: function(callback) {
					if (options.logCallback) {
						console.log(callback);
					}

					self.$form.removeClass("af-sending-request");
					self.$submitButton.prop("disabled", false);
					self.ajaxError(callback);
				},
			});
		}

		AjaxForm.prototype.activateAjax = function()
		{
			if (options.invisibleRecaptcha === true) {
				// Submiting form in invisible recaptcha callback,
				// callback must be within window "namespace"
				window[this.invisibleRecaptchaId] = this.submitForm.bind(this);

				// Add recaptcha callback to button
				this.$recaptchaSubmitButton.attr("data-callback", this.invisibleRecaptchaId);
			}
			else {
				// Submit form via AJAX after click on submit button
				var self = this;
				this.$submitButton.click(function(e) {
					e.preventDefault();
					self.submitForm();
				});
			}
		}

		// For each form here activate ajax request
		return this.each(function() {
			var ajaxForm = new AjaxForm(this, options);
			ajaxForm.activateAjax();
		});
	};

}( jQuery ));

