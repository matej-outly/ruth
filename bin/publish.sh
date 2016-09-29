#!/bin/bash

#
# Publish all RUTH gems to rubygems server
#

# Number of arguments
if [ "$#" != "0" ]; then
	echo "Usage: $0"
	exit 1
fi

# Basic setting
script_dir="`cd \"\`dirname \\\"$0\\\"\`\"; pwd`"
root_dir="$script_dir/.."
build_dir="$root_dir/build"

# Install all engines
cat "$script_dir/modules.conf" | while read module; do
	module="$(echo -e "${module}" | tr -d '[[:space:]]')"
	gem inabox "$build_dir"/"$module"-*
done

