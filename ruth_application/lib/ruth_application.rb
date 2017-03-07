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
	@@pprofile_show_avatar = true
	mattr_accessor :profile_show_picture
	@@pprofile_show_picture = true

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

end
