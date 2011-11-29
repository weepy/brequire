#!/bin/bash

# replaces the Chrome executable with a script which calls the original executable with the -allow-file-access-from-files argument.
# pass the path to the Chrome executable as the first argument.

# run like :
# ./fix_chrome.sh /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome 

original_path="$1"
base="$(basename "$original_path")"
new_path="$(dirname "$original_path")/$base-bin"

if [ ! -f "$original_path" ] || [ ! -x "$original_path" ]; then
    echo "not an executable"
    exit 1
fi

if [ -f "$new_path" ]; then
    echo "already patched"
    exit 1
fi

mv "$original_path" "$new_path"
echo '#!/bin/bash' > "$original_path"
echo "exec \"\${0%/*}/$base-bin\" -allow-file-access-from-files \"\$@\"" >> "$original_path"
chmod +x "$original_path"
