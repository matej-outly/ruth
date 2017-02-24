$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
version = File.read(File.expand_path('../../RUTH_VERSION', __FILE__)).strip

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
	s.name        = "ruth_base"
	s.version     = version
	s.authors     = ["Matej Outly (Clockstar s.r.o.)"]
	s.email       = ["matej@clockstar.cz"]
	s.homepage    = "http://www.clockstar.cz"
	s.summary     = "Rug bootstrap theme base"
	s.description = "A set of JavaScript plugings for usage in frontend."
	s.license     = "MIT"

	s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.rdoc"]
	s.test_files = Dir["test/**/*"]

end
