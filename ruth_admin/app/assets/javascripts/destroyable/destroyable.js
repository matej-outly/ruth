$.fn.destroyable = function(set_options) {

	var options = $.extend({
		destroyButtonStyle: "danger",
		destroyButtonIcon: "trash",
		destroyButtonSize: "xs",
		confirmTitle: "Are you sure?",
		confirmMessage: "If you confirm this dialog, item will be removed immediately. This operation cannot reverted.",
		successMessage: "Item has been succesfully removed.",
		errorMessage: "Unable to remove item.",
	}, set_options);

	this.each(function(index, element) {
		
		var _this = $(element);
		var id = parseInt(_this.data("id"));
		var url = _this.data("destroyUrl");
		var destroy_selector = _this.data("destroy");

		// Define elements
		var destroy_el = null;
		if (!destroy_selector) {
			destroy_el = $('<div class="btn btn-' + options.destroyButtonStyle + ' btn-' + options.destroyButtonSize + ' editable-toggle"><i class="fa fa-' + options.destroyButtonIcon + '"></i></div>');
		} else {
			destroy_el = _this.find(destroy_selector);
		}
		
		// Value click
		destroy_el.click(function(e) {
			e.preventDefault();
			var perform_destroy = () => { 
				$.ajax({
					url: url,
					dataType: 'json',
					type: 'DELETE',
					success: function(callback) 
					{
						if (callback === id) {
							_this.remove();
							if (typeof alertify != 'undefined') {
								alertify.success(options.successMessage);
							}
						} else {
							if (typeof alertify != 'undefined') {
								alertify.success(options.errorMessage);
							}
						}
					},
					error: function(callback) 
					{
						console.error(callback);
					}
				});
			}
			if (typeof alertify != 'undefined') {
				alertify.confirm(options.confirmTitle, options.confirmMessage, function() {
					perform_destroy();
				}, function() {});
			} else {
				if (confirm(options.confirmTitle)) {
					perform_destroy();
				}
			}
		});

		// Modify HTML
		if (!destroy_selector) {
			_this.append(destroy_el);
		} // else already added

	});
	
	return this;
}
