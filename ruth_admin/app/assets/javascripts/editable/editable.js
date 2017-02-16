$.fn.editable = function(setOptions) {

	var options = $.extend({
		toggleButtonStyle: "default",
		toggleButtonIcon: "pencil",
		toggleButtonSize: "xs",
		okButtonStyle: "primary",
		okButtonIcon: "check",
		cancelButtonStyle: "danger",
		cancelButtonIcon: "times",
		formSize: "sm"
	}, setOptions);

	this.each(function(index, element) {
		
		var _this = $(element);
		var value = _this.html().trim();
		var id = parseInt(_this.data("id"));
		var url = _this.data("updateUrl");
		var model = _this.data("model");
		var column = _this.data("column");
		var toggleSelector = _this.data("toggle");

		// Define elements
		var valueEl = $('<span class="editable-value">' + _this.html() + '</span>');
		var toggleEl = null;
		if (!toggleSelector) {
			toggleEl = $('<div class="btn btn-' + options.toggleButtonStyle + ' btn-' + options.toggleButtonSize + ' editable-toggle"><i class="fa fa-' + options.toggleButtonIcon + '"></i></div>');
		} else {
			toggleEl = _this.find(toggleSelector);
		}
		var formEl = $(
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
		var inputEl = formEl.find(".editable-input");
		
		// Value click
		toggleEl.click(function(e) {
			e.preventDefault();
			var value = valueEl.html().trim();
			inputEl.val(value);
			formEl.show();
			valueEl.hide();
			toggleEl.hide();
		});

		// Hide form by default
		formEl.hide();
		
		// OK button click
		formEl.find(".editable-ok").click(function(e) {
			e.preventDefault();
			var value = inputEl.val();
			$.ajax({
				url: url,
				dataType: 'json',
				type: 'PUT',
				data: formEl.find('input').serialize(),
				success: function(callback) 
				{
					inputEl.removeClass("has-error");
					if (callback === id) {
						valueEl.html(value);
						formEl.hide();
						valueEl.show();
						toggle_el.show();
					} else {
						inputEl.addClass("has-error");
					}
				},
				error: function(callback) 
				{
					console.error(callback);
				}
			});
		});

		// Cancel button click
		formEl.find(".editable-cancel").click(function(e) {
			e.preventDefault();
			formEl.hide();
			valueEl.show();
			toggleEl.show();
		});

		// Modify HTML
		_this.html("");
		_this.append(valueEl);
		if (!toggleSelector) {
			_this.append(toggleEl);
		} // else already added
		_this.append(formEl);

	});

	return this;
}
