/*****************************************************************************/
/* Copyright (c) Clockstar s.r.o. All rights reserved.                       */
/*****************************************************************************/
/*                                                                           */
/* Destoyable - plugin to call destroy action on records via Ajax request    */
/*                                                                           */
/* Author: Matěj Outlý                                                       */
/* Date  : 20. 2. 2017                                                       */
/*                                                                           */
/*****************************************************************************/

$.fn.destroyable = function(setOptions) {

	var options = $.extend({
		destroyButtonStyle: "danger",
		destroyButtonIcon: "trash",
		destroyButtonSize: "xs",
		confirmTitle: "Are you sure?",
		confirmMessage: "If you confirm this dialog, item will be removed immediately. This operation cannot reverted.",
		successMessage: "Item has been succesfully removed.",
		errorMessage: "Unable to remove item.",
	}, setOptions);

	this.each(function(index, element) {
		
		var _this = $(element);
		var id = parseInt(_this.data("id"));
		var url = _this.data("destroyUrl");
		var destroySelector = _this.data("destroy");

		// Define elements
		var destroyEl = null;
		if (!destroySelector) {
			destroyEl = $('<div class="btn btn-' + options.destroyButtonStyle + ' btn-' + options.destroyButtonSize + ' editable-toggle"><i class="fa fa-' + options.destroyButtonIcon + '"></i></div>');
		} else {
			destroyEl = _this.find(destroySelector);
		}
		
		// Value click
		destroyEl.click(function(e) {
			e.preventDefault();
			var performDestroy = function() { 
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
					performDestroy();
				}, function() {});
			} else {
				if (confirm(options.confirmTitle)) {
					performDestroy();
				}
			}
		});

		// Modify HTML
		if (!destroySelector) {
			_this.append(destroyEl);
		} // else already added

	});
	
	return this;
}
