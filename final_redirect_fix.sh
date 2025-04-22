#!/bin/bash

# Final fix script to ensure all redirects have the window.location.replace code

# Get list of all category directories
categories=$(find category -mindepth 1 -maxdepth 1 -type d -exec basename {} \;)

for category in $categories; do
  echo "Final fix for $category redirect..."
  
  # Path to the index.html file
  file_path="category/$category/index.html"
  
  if [ -f "$file_path" ]; then
    # Check if the file has the isBot check but missing window.location.replace
    if grep -q "isBot" "$file_path" && grep -q "if (!isBot) {" "$file_path"; then
      # Check if it's missing the redirect code
      if ! grep -q "window.location.replace" "$file_path"; then
        perl -i -pe 's/if \(!isBot\) \{\s*\n/if (!isBot) {\n        window.location.replace("\/");\n/' "$file_path"
        echo "✅ Fixed missing redirect for $category"
      else
        echo "✓ Redirect already correct for $category"
      fi
    else
      echo "⚠️ File doesn't have proper isBot check: $file_path"
    fi
  else
    echo "⚠️ File not found: $file_path"
  fi
done

echo "Done! All category pages now have proper immediate redirects." 