#!/bin/bash

# Script to fix Google indexing issues for category pages
# This script adds a delay to redirects and improves SEO without changing styling or links

# Get list of all category directories
categories=$(find category -mindepth 1 -maxdepth 1 -type d -exec basename {} \;)

for category in $categories; do
  echo "Fixing indexing for $category..."
  
  # Path to the index.html file
  file_path="category/$category/index.html"
  
  # Read the file
  content=$(cat "$file_path")
  
  # Check if the file contains the redirect script
  if grep -q "window.location.replace" "$file_path"; then
    # Make a backup
    cp "$file_path" "${file_path}.bak"
    
    # Add robots meta tag to ensure indexing
    sed -i '' 's/<meta name="viewport"/<meta name="robots" content="index, follow">\
    <meta name="viewport"/' "$file_path"
    
    # Fix the redirect script with a delay for search engines
    sed -i '' 's/\/\/ Redirect to the main page which will handle showing the right category/\/\/ Delay redirect to allow search engines to see the content\
    \/\/ Bot detection to avoid redirecting search engines\
    var isBot = \/bot|googlebot|crawler|spider|robot|crawling\/i.test(navigator.userAgent);\
    if (!isBot) {\
        setTimeout(function() {\
            window.location.replace('\/');\
        }, 100);\
    }/' "$file_path"
    
    # Remove the direct redirect line
    sed -i '' '/window.location.replace/d' "$file_path"
    
    # Make the hidden content visible to search engines but keep the styling intact
    sed -i '' 's/style="display:none"/style="display:block" class="seo-content"/' "$file_path"
    
    echo "✅ Fixed $category"
  else
    echo "⚠️ No redirect found in $category, skipping"
  fi
done

echo "Creating CSS to hide SEO content for users but keep it visible for search engines..."

# Check if the CSS file exists and add styles for the seo-content class
if [ -f "css/style.css" ]; then
  echo "
/* SEO content visibility - visible to crawlers but not to users */
.seo-content {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
" >> css/style.css

  # Touch the CSS file to update modification time
  touch css/style.css
  echo "✅ Added CSS to hide SEO content from users"
else
  echo "⚠️ CSS file not found at css/style.css"
fi

echo "Done! All category pages have been updated for better indexing." 