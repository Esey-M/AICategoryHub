#!/bin/bash

# This script enhances the bot detection on category pages
# to ensure search engines can properly index the content

echo "Enhancing bot detection for search engine indexability..."

for category_dir in category/*/; do
  # Get the category name from directory path
  category=$(basename "$category_dir")
  
  # File path
  file="${category_dir}index.html"
  
  # Skip if file doesn't exist
  if [ ! -f "$file" ]; then
    continue
  fi
  
  echo "Processing: $category"
  
  # Create backup
  cp "$file" "${file}.botbak"
  
  # Replace the bot detection function with an improved version
  sed -i.bak 's/function isCrawler() {/function isCrawler() {\n        \/\/ Explicitly check for Googlebot and other major crawlers first\n        if(navigator.userAgent.indexOf("Googlebot") > -1 || \n           navigator.userAgent.indexOf("Bingbot") > -1 || \n           navigator.userAgent.indexOf("Slurp") > -1 || \n           navigator.userAgent.indexOf("DuckDuckBot") > -1 || \n           navigator.userAgent.indexOf("Baiduspider") > -1 || \n           navigator.userAgent.indexOf("YandexBot") > -1 || \n           navigator.userAgent.indexOf("Sogou") > -1) {\n            return true;\n        }/' "$file"
  
  # Add noindex directive to body for non-bots
  sed -i.bak 's/<body>/<body>\n    <!-- Signal to search engines that this page is indexable -->\n    <meta name="robots" content="index, follow">/' "$file"
  
  # Remove the aria-hidden attribute from the SEO content for better indexing
  sed -i.bak 's/class="seo-content" aria-hidden="true"/class="seo-content"/' "$file"
  
  echo "Enhanced: $file"
done

# Clean up temporary files
find category/ -name "*.bak" -delete

echo "All category pages have been enhanced for better indexability without changing styling!" 