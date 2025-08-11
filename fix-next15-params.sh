#!/bin/bash

# Fix Next.js 15 params Promise issue in all [id] pages
files=(
  "src/app/(back)/dashboard/products/brands/[id]/page.tsx"
  "src/app/(back)/dashboard/products/brands/[id]/edit/page.tsx"
  "src/app/(back)/dashboard/products/units/[id]/page.tsx"
  "src/app/(back)/dashboard/products/units/[id]/edit/page.tsx"
  "src/app/(back)/dashboard/products/[id]/page.tsx"
  "src/app/(back)/dashboard/products/[id]/edit/page.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    
    # Fix params type declaration
    sed -i 's/params: {/params: Promise<{/' "$file"
    sed -i 's/  }/  }>/' "$file"
    
    # Add React.use() call
    sed -i 's/export default function \([^(]*\)({ params }: \([^)]*\)) {/export default function \1({ params }: \2) {\
  const resolvedParams = React.use(params)/' "$file"
    
    # Replace params.id with resolvedParams.id
    sed -i 's/params\.id/resolvedParams.id/g' "$file"
    
    echo "Fixed $file"
  else
    echo "File not found: $file"
  fi
done

echo "All files processed!"