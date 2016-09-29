#!/bin/bash

#
# Build all RUTH gems
#

# Number of arguments
if [ "$#" != "0" ]; then
	echo "Usage: $0"
	exit 1
fi

# Basic setting
script_dir="`cd \"\`dirname \\\"$0\\\"\`\"; pwd`"
root_dir="$script_dir/.."
output_dir="$root_dir/build"

# Make output directory
mkdir -p "$output_dir"

# All engines
cat "$script_dir/modules.conf" | while read module; do
	module="$(echo -e "${module}" | tr -d '[[:space:]]')"
	cd "$root_dir/$module"
	gem build $module.gemspec
	mv *.gem "$output_dir"
done

