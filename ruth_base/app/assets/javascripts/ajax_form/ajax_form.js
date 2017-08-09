/*****************************************************************************/
/* Copyright (c) Clockstar s.r.o. All rights reserved.                       */
/*****************************************************************************/
/*                                                                           */
/* AjaxForm - plugin for form handling via Ajax (submit, messages)           */
/*                                                                           */
/* Author: Jaroslav Mlejnek, Matěj Outlý                                     */
/* Date  : 20. 2. 2017                                                       */
/*                                                                           */
/*****************************************************************************/

/*****************************************************************************/
/*
/* Options:
/* - flashSelector (string)  ... Selector for inline flash container, if not provided, Alertify plugin auto detected and used if possible
/* - successMessage (string) ... Message displayed at success
/* - errorMessage (string)   ... Message displayed at error
/* - clearOnSubmit (boolean) ... Clear form values when successfuly submitted?
/* - onSuccess (function)    ... What to do when form is successfuly submitted
/* - onError (function)      ... What to do when form is NOT successfuly submitted
/* - log (boolean)           ... Log success and error callbacks into console (for debugging purposes)
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
			onSuccess: null,
			onError: null,
			invisibleRecaptcha: null, // null means auto-detect
			log: false,
		}, setOptions);

		// Constructor
		function AjaxForm(form, options)
		{
			// Basic configuration
			this.$form = $(form);
			this.options = (typeof options !== 'undefined' ? options : {});

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

		// ********************************************************************
		// Predefined behaviors (must be manualy connected through onSuccess callback)
		// ********************************************************************

		AjaxForm.prototype.toggleModal = function(selector)
		{
			var $modal = $(selector);
			if ($modal.length > 0) {
				$modal.modal("toggle");
			}
		}

		// Hide form (by setting .af-hidden CSS class). If timeout given, form is shown again after this time.
		AjaxForm.prototype.hideForm = function(timeout)
		{
			var self = this;
			$container = this.$form.find(".af-container");
			if ($container.length == 0) {
				$container = this.$form;
			}
			$container.addClass("af-hidden")
			if (timeout) {
				setTimeout(function() {
					$container.removeClass("af-hidden");
				}, timeout * 1000);
			}
		}

		// Call reload function on gevin JS object with given ID as parameter
		AjaxForm.prototype.reloadObject = function(objectName, id)
		{
			eval('var object = ' + objectName.toString() + ';');
			object.reload(id);
		}
		
		// ********************************************************************
		// Flash
		// ********************************************************************

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

		// ********************************************************************
		// Clear
		// ********************************************************************

		AjaxForm.prototype.clearErrors = function()
		{
			this.$form.find(".errors").empty();
			this.$form.find(".has-error").removeClass("has-error");
		}

		AjaxForm.prototype.clearRecaptcha = function()
		{
			if (typeof grecaptcha != "undefined" && this.$form.find(".g-recaptcha")) {
				grecaptcha.reset();
			}
		}

		AjaxForm.prototype.clearForm = function()
		{
			this.clearErrors();
			this.clearRecaptcha();
			if (this.options.clearOnSubmit) {
				this.$form.find(".form-control").val("");
			}
		}

		// ********************************************************************
		// Submit logic
		// ********************************************************************

		AjaxForm.prototype.requestSuccess = function(id)
		{
			// Everything is OK
			this.setFlashMessage(true);
			this.clearForm();
			
			// Succes submit callback
			if (this.options.onSuccess && typeof(this.options.onSuccess) === "function") {
				this.options.onSuccess(this, id);
			}
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

			// Error callback
			if (this.options.onError && typeof(this.options.onError) === "function") {
				this.options.onError(this, callback);
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

