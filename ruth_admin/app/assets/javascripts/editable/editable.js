$.fn.editable = function(set_options) {

	var options = $.extend({
		toggleButtonStyle: "default",
		toggleButtonIcon: "pencil",
		toggleButtonSize: "xs",
		okButtonStyle: "primary",
		okButtonIcon: "check",
		cancelButtonStyle: "danger",
		cancelButtonIcon: "times",
		formSize: "sm"
	}, set_options);

	this.each(function(index, element) {
		
		var _this = $(element);
		var value = _this.html().trim();
		var id = parseInt(_this.data("id"));
		var url = _this.data("updateUrl");
		var model = _this.data("model");
		var column = _this.data("column");
		var toggle_selector = _this.data("toggle");

		// Define elements
		var value_el = $('<span class="editable-value">' + _this.html() + '</span>');
		var toggle_el = null;
		if (!toggle_selector) {
			toggle_el = $('<div class="btn btn-' + options.toggleButtonStyle + ' btn-' + options.toggleButtonSize + ' editable-toggle"><i class="fa fa-' + options.toggleButtonIcon + '"></i></div>');
		} else {
			toggle_el = _this.find(toggle_selector);
		}
		var form_el = $(
			'<form class="editable-form">' +
			'<div class="input-group">' +
			'<input class="editable-input form-control input-' + options.formSize + '" type="text" name="' + model + '[' + column + ']" />' +
			'<span class="input-group-btn">' +
			'<div class="btn btn-' + options.okButtonStyle + ' btn-' + options.formSize + ' editable-ok"><i class="fa fa-' + options.okButtonIcon + '"></i></div>' +
			'<div class="btn btn-' + options.cancelButtonStyle + ' btn-' + options.formSize + ' editable-cancel"><i class="fa fa-' + options.cancelButtonIcon + '"></i></div>' +
			'</span>' +
			'</div>' +
			'</form>'
		);
		var input_el = form_el.find(".editable-input");
		
		// Value click
		toggle_el.click(function(e) {
			e.preventDefault();
			var value = value_el.html().trim();
			input_el.val(value);
			form_el.show();
			value_el.hide();
			toggle_el.hide();
		});

		// Hide form by default
		form_el.hide();
		
		// OK button click
		form_el.find(".editable-ok").click(function(e) {
			e.preventDefault();
			var value = input_el.val();
			$.ajax({
				url: url,
				dataType: 'json',
				type: 'PUT',
				data: form_el.find('input').serialize(),
				success: function(callback) 
				{
					input_el.removeClass("has-error");
					if (callback === id) {
						value_el.html(value);
						form_el.hide();
						value_el.show();
						toggle_el.show();
					} else {
						input_el.addClass("has-error");
					}
				},
				error: function(callback) 
				{
					console.error(callback);
				}
			});
		});

		// Cancel button click
		form_el.find(".editable-cancel").click(function(e) {
			e.preventDefault();
			form_el.hide();
			value_el.show();
			toggle_el.show();
		});

		// Modify HTML
		_this.html("");
		_this.append(value_el);
		if (!toggle_selector) {
			_this.append(toggle_el);
		} // else already added
		_this.append(form_el);

	});

	return this;
}
