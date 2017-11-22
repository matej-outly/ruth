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
/* - uploadFile (boolean)    ... Whether the form should send file for upload
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

		// Call reload current page
		AjaxForm.prototype.reloadPage = function()
		{
			window.location.reload();
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

		AjaxForm.prototype.clearForm = function()
		{
			this.clearErrors();
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
			if ((callback ^ 0) === callback) { // == Number.isInteger(callback) does not work in IE...
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
		}

		AjaxForm.prototype.submitForm = function()
		{
			var self = this;
			var formParams = {};
			
			// URL
			var url = this.url();

			// State change
			this.$form.addClass("af-sending-request");
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
				success: function(callback) {
					if (options.logCallback) {
						console.log(callback);
					}

					// State change
					self.$form.removeClass("af-sending-request");
					self.$submitButton.prop("disabled", false);

					// Callback
					self.ajaxSuccess(callback);
				},

				// Error data fetch
				error: function(callback) {
					if (options.logCallback) {
						console.log(callback);
					}

					// State change
					self.$form.removeClass("af-sending-request");
					self.$submitButton.prop("disabled", false);

					// Callback
					self.ajaxError(callback);
				},
			}, formParams);

			// Request
			$.ajax(formParams);
		}

		AjaxForm.prototype.activateAjax = function()
		{
			// Submit form via AJAX after click on submit button
			var self = this;
			this.$submitButton.click(function(e) {
				e.preventDefault();
				self.submitForm();
			});
		}

		// For each form here activate ajax request
		return this.each(function() {
			var ajaxForm = new AjaxForm(this, options);
			ajaxForm.activateAjax();
		});
	};

}( jQuery ));

