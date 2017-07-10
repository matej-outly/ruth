# *****************************************************************************
# * Copyright (c) Clockstar s.r.o. All rights reserved.
# *****************************************************************************
# *
# * RuthAdmin
# *
# * Author: Matěj Outlý
# * Date  : 29. 9. 2016
# *
# *****************************************************************************

# Engie
require "ruth_admin/engine"

# Railtie
require "ruth_admin/railtie" if defined?(Rails)

module RuthAdmin

	# *************************************************************************
	# Configuration
	# *************************************************************************

	#
	# Default way to setup module
	#
	def self.setup
		yield self
	end

	# *************************************************************************
	# Config options
	# *************************************************************************

	#
	# Screen CSS layout
	#
	mattr_accessor :css_layout
	@@css_layout = "admin"

	#
	# JS layout
	#
	mattr_accessor :js_layout
	@@js_layout = "admin"

	#
	# Title
	#
	mattr_accessor :title
	@@title = "Administrace"

	#
	# Header logo URL and image
	#
	mattr_accessor :header_logo_url
	@@header_logo_url = "main_app.root_path"
	mattr_accessor :header_logo_image
	@@header_logo_image = "ruth_admin/header_logo.png"

	#
	# Client info
	#
	mattr_accessor :client_name
	@@client_name = "Klient"
	mattr_accessor :client_year
	@@client_year = 2016
	mattr_accessor :client_url
	@@client_url = "http://www.klient.cz"
	mattr_accessor :client_image
	@@client_image = "ruth_admin/footer_logo_client.png"

	#
	# Developer info
	#
	mattr_accessor :developer_name
	@@developer_name = "Clockstar s.r.o."
	mattr_accessor :developer_year
	@@developer_year = 2012
	mattr_accessor :developer_url
	@@developer_url = "http://www.clockstar.cz"
	mattr_accessor :developer_image
	@@developer_image = "ruth_admin/footer_logo_clockstar.png"

	#
	# Footer menu
	#
	mattr_accessor :footer_menu
	@@footer_menu = [
		{
			label: "headers.ruth_admin.pages.terms",
			url: "ruth_admin.pages_terms_path"
		},
		{
			label: "headers.ruth_admin.pages.accessibility",
			url: "ruth_admin.pages_accessibility_path"
		},
		{
			label: "headers.ruth_admin.pages.help",
			url: "ruth_admin.pages_help_path"
		},
		{
			label: "headers.ruth_admin.pages.contact",
			url: "ruth_admin.pages_contact_path"
		}
	]

	#
	# Header menu
	#
	mattr_accessor :header_menu
	@@header_menu = []
	
	#
	# Condition to show profile menu
	#
	mattr_accessor :show_profile_menu_if
	@@show_profile_menu_if = nil

	#
	# Condition to show session menu
	#
	mattr_accessor :show_session_menu_if
	@@show_session_menu_if = nil

	#
	# Use Turbolinks for admin render (you need to manually add turbolinks gem and include it to assets pipeline)
	#
	mattr_accessor :use_turbolinks
	@@use_turbolinks = false

	#
	# Make sidebar permament through turbolinks requests
	#
	mattr_accessor :sidebar_turbolink_permanent
	@@sidebar_turbolink_permanent = true

	#
	# Include TinyMCE init script generated from tinymce.yml if available
	#
	mattr_accessor :include_default_tinymce
	@@include_default_tinymce = true

	#
	# Include Google Maps API script
	#
	mattr_accessor :include_google_maps_api
	@@include_google_maps_api = false

	#
	# Google Maps API key (necessary for correct Google Maps API include)
	#
	mattr_accessor :google_maps_api_key
	@@google_maps_api_key = nil

	#
	# Options passed to rug_tabs component
	#
	mattr_accessor :tabs_options
	@@tabs_options = {
		header_style: "pills", 
		header_class: "hr-divider-content hr-divider-nav", 
		header_container_class: "hr-divider"
	}

	#
	# Options passed to rug_menu component in actions partial
	#
	mattr_accessor :actions_options
	@@actions_options = { 
		format: :btn,
		class: "dashhead-toolbar-item", 
		btn_style: "primary-outline",
		labels: false
	}

end
