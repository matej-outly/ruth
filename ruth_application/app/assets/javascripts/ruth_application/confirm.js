// Link with data attribute clicked
$.rails.allowAction = function(link){
	if (link.data("confirm") == undefined){
		return true;
	}
	$.rails.showConfirmationDialog(link);
	return false;
}

// User clicked confirm button
$.rails.confirmed = function(link){
	link.data("confirm", null);
	link.trigger("click.rails");
}

// Display the confirmation dialog
$.rails.showConfirmationDialog = function(link){
	var title = link.data("confirm");
	var message = link.data("confirmMessage");
	alertify.confirm(title, message, 
		function() { 
			$.rails.confirmed(link); 
		}, 
		function() {}
	);
}