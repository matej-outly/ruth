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
	# Enable Bootstrap
	#
	mattr_accessor :enable_bootstrap
	@@enable_bootstrap = true

	#
	# Enable Font Awesome
	#
	mattr_accessor :enable_font_awesome
	@@enable_font_awesome = true

end
