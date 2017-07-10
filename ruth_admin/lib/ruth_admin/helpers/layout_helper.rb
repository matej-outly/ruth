# *****************************************************************************
# * Copyright (c) Clockstar s.r.o. All rights reserved.
# *****************************************************************************
# *
# * View helper
# *
# * Author: Matěj Outlý
# * Date  : 18. 7. 2016
# *
# *****************************************************************************

module RuthAdmin
	module Helpers
		module LayoutHelper

			def controller_path
				return controller.class.name.to_snake[0..-12]
			end

			def ruth_admin_sidebar
				
				# First priority (controller specific)
				if lookup_context.find_all("#{controller_path}/_sidebar").any?
					result = render(partial: "#{controller_path}/sidebar").trim
					if !result.blank?
						return result
					end
				end

				# Second priority (layout global)
				if lookup_context.find_all("ruth_admin/_sidebar").any?
					result = render(partial: "ruth_admin/sidebar").trim
					if !result.blank?
						return result
					end
				end

				# Fallback
				return nil
			end

			def ruth_admin_actions
				
				# First priority
				if lookup_context.find_all("#{controller_path}/_actions").any?
					result = render(partial: "#{controller_path}/actions", 
						locals: { 
							options: RuthAdmin.actions_options
						}
					).trim
					if !result.blank?
						return result
					end
				end

				# Fallback
				return nil
			end

			def ruth_admin_filters

				# First priority
				if lookup_context.find_all("#{controller_path}/_filters").any?
					result = render(partial: "#{controller_path}/filters").trim
					if !result.blank?
						return result
					end
				end

				# Fallback
				return nil
			end

		end
	end
end