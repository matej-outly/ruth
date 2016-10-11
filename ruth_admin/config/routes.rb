# *****************************************************************************
# * Copyright (c) Clockstar s.r.o. All rights reserved.
# *****************************************************************************
# *
# * Routes
# *
# * Author: Matěj Outlý
# * Date  : 27. 4. 2015
# *
# *****************************************************************************

RuthAdmin::Engine.routes.draw do
	get "pages/terms"
	get "pages/accessibility"
	get "pages/help"
	get "pages/contact"
end