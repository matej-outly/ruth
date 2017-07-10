# *****************************************************************************
# * Copyright (c) Clockstar s.r.o. All rights reserved.
# *****************************************************************************
# *
# * RuthApplication
# *
# * Author: Matěj Outlý
# * Date  : 29. 9. 2016
# *
# *****************************************************************************

require "ruth_application/engine"

module RuthApplication

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
	# CSS layout
	#
	mattr_accessor :css_layout
	@@css_layout = "application"

	#
	# JS layout
	#
	mattr_accessor :js_layout
	@@js_layout = "application"

	#
	# Title
	#
	mattr_accessor :title
	@@title = "Aplikace"

	#
	# Layout
	#
	mattr_accessor :layout
	@@layout = {
		navbar: {
			header: [
				:brand,
			],
			collapse: [
				:main_menu,
				{ :profile_menu => :right },
				{ :search_form => :right },
			],
		},
		container: {
			top: [
				:breadcrumb,
			],
			left: [
				:actions,
				:help,
			],
			main: [
				:flash,
				:yield,
			],
			right: [
				:profile,
				:about,
				:copyright,
			],
		}
	}

	#
	# Mirror collapsed view?
	#
	mattr_accessor :layout_mirror_collapsed
	@@layout_mirror_collapsed = false

	#
	# Layout left column width
	#
	mattr_accessor :layout_left_column_width
	@@layout_left_column_width = 3

	#
	# Layout right column width
	#
	mattr_accessor :layout_right_column_width
	@@layout_right_column_width = 3

	#
	# Layout left column should be hidden on mobile
	#
	mattr_accessor :layout_hide_left
	@@layout_hide_left = false

	#
	# Layout right column should be hidden on mobile
	#
	mattr_accessor :layout_hide_right
	@@layout_hide_right = false

	#
	# Use inverse navbar?
	#
	mattr_accessor :navbar_inverse
	@@navbar_inverse = true

	#
	# Main menu
	#
	mattr_accessor :main_menu
	@@main_menu = []

	#
	# Profile
	#
	mattr_accessor :profile_show_sign_out
	@@profile_show_sign_out = false
	mattr_accessor :profile_show_avatar
	@@profile_show_avatar = true
	mattr_accessor :profile_show_picture
	@@profile_show_picture = true

	#
	# About
	#
	mattr_accessor :about
	@@about = [
		{ icon: "map-marker", label: "Vaše adresa..." },
		{ icon: "phone", label: "Váš telefon..." },
	]

	#
	# Copyright info
	#
	mattr_accessor :copyright_name
	@@copyright_name = "Klient"
	mattr_accessor :copyright_year
	@@copyright_year = 2016
	mattr_accessor :copyright_url
	@@copyright_url = "http://www.klient.cz"

	#
	# Copyright menu
	#
	mattr_accessor :copyright_menu
	@@copyright_menu = []

	#
	# Use Turbolinks for admin render (you need to manually add turbolinks gem and include it to assets pipeline)
	#
	mattr_accessor :use_turbolinks
	@@use_turbolinks = false

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
	@@tabs_options = {}

	#
	# Options passed to rug_menu component in actions partial
	#
	mattr_accessor :actions_options
	@@actions_options = {
		class: "actions-list"
	}

end
