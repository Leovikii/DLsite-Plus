import sys

file_path = r"c:\Users\Vki\Documents\GitHub\RJ2Link\src\core\scraper.ts"
with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# The error was at 718, 736, 737. It means lines ~705 to 738 are garbage leftover from getSearchResult.
# We want to keep everything up to line 704: `        },`
# and then skip until line 739: `    export const DLsite = {`

new_lines = lines[:704]
new_lines.append("    }\n\n")

# Find the index of DLsite
start_idx = -1
for i in range(704, len(lines)):
    if "export const DLsite = {" in lines[i]:
        start_idx = i
        break

if start_idx != -1:
    new_lines.extend(lines[start_idx:])

with open(file_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Done cutting lines.")
