#!/bin/bash

# Script to directly update all category redirects for immediate redirection while preserving SEO

# Get list of all category directories
categories=$(find category -mindepth 1 -maxdepth 1 -type d -exec basename {} \;)

for category in $categories; do
  echo "Updating redirect for $category..."
  
  # Path to the index.html file
  file_path="category/$category/index.html"
  
  if [ -f "$file_path" ]; then
    # Make a backup
    cp "$file_path" "${file_path}.bak"
    
    # Directly modify the file content to add the bot detection and immediate redirect
    # This avoids the sed command issues
    perl -i -pe '
      if (/sessionStorage\.setItem.*?\);/ && $found != 1) {
        $found = 1;
        s/(sessionStorage\.setItem.*?\);)/$1\n    \/\/ Bot detection to avoid redirecting search engines\n    var isBot = \/bot|googlebot|crawler|spider|robot|crawling\/i.test(navigator.userAgent);\n    if (!isBot) {\n        window.location.replace(\x27\/\x27);\n    }/;
      }
      if (/\/\/ Redirect to the main page/) {
        s/\/\/ Redirect to the main page.*//;
      }
      if (/window\.location\.replace\(.*?\);/) {
        s/window\.location\.replace\(.*?\);//;
      }
    ' "$file_path"
    
    echo "✅ Updated redirect for $category"
  else
    echo "⚠️ File not found: $file_path"
  fi
done

echo "Done! All category pages now have immediate redirects for users while preserving SEO for search engines." 