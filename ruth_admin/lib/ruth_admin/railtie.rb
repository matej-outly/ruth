# *****************************************************************************
# * Copyright (c) Clockstar s.r.o. All rights reserved.
# *****************************************************************************
# *
# * Railtie for view helpers integration
# *
# * Author: Matěj Outlý
# * Date  : 28. 6. 2015
# *
# *****************************************************************************

require "ruth_admin/helpers/layout_helper"

module RuthAdmin
	class Railtie < Rails::Railtie
		
		initializer "ruth_admin.helpers" do
			ActionView::Base.send :include, Helpers::LayoutHelper
		end

	end
end