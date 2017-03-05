#!/bin/bash

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

echo ""
echo "What type of component do you want to create?"
echo ""
echo "> 1: Component"
echo "> 2: Container"
echo "> 3: View"
echo ""

read component_type_option

case $component_type_option in
'1')
  component_type="components"
;;
'2')
  component_type="containers"
;;
'3')
  component_type="views"
;;
*)
  echo "ERROR: Unknown component type"
  exit 1
esac

echo ""
echo "What's the name of the component?"
echo ""

read component_name

if [ -d "$parent_path/../../dadi/frontend/$component_type/$component_name" ]; then
  echo "ERROR: Component already exists"
  exit 1
fi

cp "$parent_path/$component_type.template.jsx" "$parent_path/$component_name.jsx"
sed -ie "s/{NAME}/$component_name/g" "$parent_path/$component_name.jsx"

# Creating directory
mkdir "$parent_path/../../dadi/frontend/$component_type/$component_name"

# Moving component file
mv "$parent_path/$component_name.jsx" "$parent_path/../../dadi/frontend/$component_type/$component_name"

# Creating CSS
touch "$parent_path/../../dadi/frontend/$component_type/$component_name/$component_name.css"

echo ""
echo "Done! $component_name component has been created."
echo ""
