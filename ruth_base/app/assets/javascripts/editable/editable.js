/*****************************************************************************/
/* Copyright (c) Clockstar s.r.o. All rights reserved.                       */
/*****************************************************************************/
/*                                                                           */
/* Editable - plugin for inline records editation via Ajax request           */
/*                                                                           */
/* Author: Matěj Outlý                                                       */
/* Date  : 20. 2. 2017                                                       */
/*                                                                           */
/*****************************************************************************/

$.fn.editable = function(setOptions) {

	var globalOptions = $.extend({
		id: null,
		model: null,
		column: null,
		updateUrl: null,
		toggleElement: null, // This cannot be passed by data attribute
		toggleSelector: null,
		toggleButtonStyle: "default",
		toggleButtonIcon: "pencil",
		toggleButtonSize: "xs",
		okButtonStyle: "primary",
		okButtonIcon: "check",
		cancelButtonStyle: "danger",
		cancelButtonIcon: "times",
		toggled: false,
		formSize: "sm",
		onToggleIn: null, // This cannot be passed by data attribute
		onToggleOut: null, // This cannot be passed by data attribute
		onSuccess: null, // This cannot be passed by data attribute
		onError: null, // This cannot be passed by data attribute
	}, setOptions);

	this.each(function(index, element) {
		
		var _this = $(element);
		var value = _this.html().trim();
		
		// Options
		var options = $.extend({}, globalOptions);
		var overrideOptions = {
			id: _this.data("id"),
			model: _this.data("model"),
			column: _this.data("column"),
			updateUrl: _this.data("updateUrl"),
			toggleSelector: _this.data("toggleSelector"),
			toggleButtonStyle: _this.data("toggleButtonStyle"),
			toggleButtonIcon: _this.data("toggleButtonIcon"),
			toggleButtonSize: _this.data("toggleButtonSize"),
			okButtonStyle: _this.data("okButtonStyle"),
			okButtonIcon: _this.data("okButtonIcon"),
			cancelButtonStyle: _this.data("cancelButtonStyle"),
			cancelButtonIcon: _this.data("cancelButtonIcon"),
			toggled: (_this.data("toggled") ? (_this.data("toggled") == "true") : undefined),
			formSize: _this.data("formSize"),
		};
		for (var key in options) {
			if (overrideOptions[key]) {
				options[key] = overrideOptions[key];
			}
		}

		// Define elements
		var $valueEl = $('<span class="editable-value">' + _this.html() + '</span>');
		var $toggleEl = null;
		var ownToggleElement = false;
		if (options.toggleElement) {
			$toggleEl = options.toggleElement;
		} else if (options.toggleSelector) {
			$toggleEl = $(options.toggleSelector);
		} else {
			ownToggleElement = true;
			$toggleEl = $('<div class="btn btn-' + options.toggleButtonStyle + ' btn-' + options.toggleButtonSize + ' editable-toggle"><i class="fa fa-' + options.toggleButtonIcon + '"></i></div>');
		}
		var $formEl = $(
			'<form class="editable-form">' +
			'<div class="input-group">' +
			'<input class="editable-input form-control input-' + options.formSize + '" type="text" name="' + options.model + '[' + options.column + ']" />' +
			'<span class="input-group-btn">' +
			'<div class="btn btn-' + options.okButtonStyle + ' btn-' + options.formSize + ' editable-ok"><i class="fa fa-' + options.okButtonIcon + '"></i></div>' +
			'<div class="btn btn-' + options.cancelButtonStyle + ' btn-' + options.formSize + ' editable-cancel"><i class="fa fa-' + options.cancelButtonIcon + '"></i></div>' +
			'</span>' +
			'</div>' +
			'</form>'
		);
		var $inputEl = $formEl.find(".editable-input");
		
		// Value click
		$toggleEl.click(function(e) {
			e.preventDefault();
			var value = $valueEl.html().trim();
			$inputEl.val(value);
			$inputEl.focus();
			$formEl.show();
			$valueEl.hide();
			$toggleEl.hide();
			if (options.onToggleIn) {
				options.onToggleIn();
			}
		});

		// Hide form by default
		$formEl.hide();
		
		// OK button click
		$formEl.find(".editable-ok").click(function(e) {
			e.preventDefault();
			var value = $inputEl.val();
			$.ajax({
				url: options.updateUrl,
				dataType: 'json',
				type: 'PUT',
				data: $formEl.find('input').serialize(),
				success: function(callback) 
				{
					$inputEl.removeClass("has-error");
					if (callback === options.id) {
						$valueEl.html(value);
						$formEl.hide();
						$valueEl.show();
						$toggleEl.show();
						if (options.onSuccess) {
							options.onSuccess(value);
						}
						if (options.onToggleOut) {
							options.onToggleOut();
						}
					} else {
						$inputEl.addClass("has-error");
						if (options.onError) {
							options.onError();
						}
						if (options.onToggleOut) {
							options.onToggleOut();
						}
					}
				},
				error: function(callback) 
				{
					console.error(callback);
				}
			});
		});

		// Cancel button click
		$formEl.find(".editable-cancel").click(function(e) {
			e.preventDefault();
			$formEl.hide();
			$valueEl.show();
			$toggleEl.show();
			if (options.onToggleOut) {
				options.onToggleOut();
			}
		});

		// Modify HTML
		_this.html("");
		_this.append($valueEl);
		if (ownToggleElement) {
			_this.append($toggleEl);
		} // else already added
		_this.append($formEl);

		// Toggled?
		if (options.toggled) {
			$toggleEl.trigger('click');
		}

	});

	return this;
}
