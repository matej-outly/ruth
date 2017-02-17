/*

Options on form element:

data-ajax-flash-target
data-ajax-flash-success
data-ajax-flash-error

data-ajax-form-on-success = "hide"
data-ajax-form-on-success-timeout = in seconds to give back empty form

*/


(function ( $ ) {

	$.fn.ajaxForm = function(options) {

		var settings = $.extend({
		}, options);


		function AjaxForm(form) {
			this.$form = $(form);
		}

		AjaxForm.prototype.url = function() {
			return this.$form.attr("action");
		}

		AjaxForm.prototype.id = function() {
			return this.$form.attr("id");
		}

		AjaxForm.prototype.dataOnSuccess = function() {
			return this.$form.attr("data-ajax-form-on-success")
		}

		AjaxForm.prototype.dataOnSuccessTimeout = function() {
			if (this.$form.attr("data-ajax-form-on-success-timeout")) {
				return parseInt(this.$form.attr("data-ajax-form-on-success-timeout"));
			}
			else {
				return null;
			}
		}

		AjaxForm.prototype.setFlashMessage = function(result) {
			$target = this.$form.attr("data-ajax-flash-target");
			if ($target) {
				var message = result ? this.$form.attr("data-ajax-flash-success") : this.$form.attr("data-ajax-flash-error");
				$target.val(message);
			}
		}

		AjaxForm.prototype.setHiddenEffect = function() {
			var self = this;

			if (this.$form.attr("data-ajax-form-on-success") == "hide") {
				$formContainer = this.$form.find(".ajax-form-container")
				$formContainer.addClass("ajax-form-success")

				if (this.dataOnSuccessTimeout()) {
					setTimeout(function() {
						self.clearForm();
						$formContainer.removeClass("ajax-form-success");
					}, this.dataOnSuccessTimeout() * 1000);

				}
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
			this.$form.find(".form-control").val("");
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
			this.setHiddenEffect(true);
		}

		AjaxForm.prototype.requestError = function(callback)
		{
			// Something is bad
			this.setFlashMessage(false);
			this.clearErrors();
			this.clearRecaptcha();

			// Set messages
			for (var field in callback) {
				var fieldId = this.id() + "_" + field + "_errors";
				var $field = $("#" + fieldId);

				var errors = callback[field];
				for (var i = 0; i < errors.length; ++i) {
					$field.append("<span class=\"help-block\">" + errors[i] + "</span>");
					$field.closest(".form-group").addClass("has-error")
				}
			}
		}

		AjaxForm.prototype.ajaxSuccess = function(callback)
		{
			if (Number.isInteger(callback)) {
				this.requestSuccess(callback);
			}
			else {
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

				self.$form.addClass("ajax-form-sending-request");
				$submitButton.prop("disabled", true);

				// Request
				$.ajax({
					url: url,
					dataType: "json",
					type: "POST",
					data: self.$form.serialize(),

					// Success data fetch
					success: function(callback) { self.$form.removeClass("ajax-form-sending-request"); $submitButton.prop("disabled", false); self.ajaxSuccess(callback); },

					// Error data fetch
					error: function(callback) { self.$form.removeClass("ajax-form-sending-request"); $submitButton.prop("disabled", false); self.ajaxError(callback); },
				});
			});
		}


		return this.each(function() {
			// For each form here activate ajax request
			var ajaxForm = new AjaxForm(this);
			ajaxForm.activateAjax();
		});
	};

}( jQuery ));

