$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
version = File.read(File.expand_path('../../RUTH_VERSION', __FILE__)).strip

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
	s.name        = "ruth_application"
	s.version     = version
	s.authors     = ["Matej Outly (Clockstar s.r.o.)"]
	s.email       = ["matej@clockstar.cz"]
	s.homepage    = "http://www.clockstar.cz"
	s.summary     = "Rug bootstrap theme for web applications"
	s.description = "A set of CSS and JavaScript components suitable for building frontend of standard web application based on Ruby on Rails / Rug / Bootstrap."
	s.license     = "MIT"

	s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.rdoc"]
	s.test_files = Dir["test/**/*"]

	s.add_dependency "bootstrap-sass", "~> 3.3"
	s.add_dependency "font-awesome-sass", "~> 4.6"
	s.add_dependency "momentjs-rails", "~> 2.15"

end
