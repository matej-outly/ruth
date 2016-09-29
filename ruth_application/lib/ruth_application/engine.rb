# *****************************************************************************
# * Copyright (c) Clockstar s.r.o. All rights reserved.
# *****************************************************************************
# *
# * Engine
# *
# * Author: Matěj Outlý
# * Date  : 29. 9. 2016
# *
# *****************************************************************************

module RuthApplication
	class Engine < ::Rails::Engine
		isolate_namespace RuthApplication
	end
end