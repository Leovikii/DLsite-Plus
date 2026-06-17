import sys

with open("c:/Users/Vki/Documents/GitHub/RJ2Link/src/core/parser.ts", "r", encoding="utf-8") as f:
    lines = f.readlines()

output = []
in_broken = False
for line in lines:
    if "linkify: function (textNode) {" in line:
        output.append("        linkify: function (textNode: any) {\n")
        output.append("            const nodeOriginalText = textNode.nodeValue;\n")
        output.append("            const matches: any[] = [];\n")
        output.append("            let match;\n")
        output.append("            while (match = RJ_REGEX.exec(nodeOriginalText)) {\n")
        output.append("                matches.push({\n")
        output.append("                    index: match.index,\n")
        output.append("                    value: match[0],\n")
        output.append("                });\n")
        output.append("            }\n")
        output.append("            if (matches.length === 0) return;\n")
        output.append("            textNode.nodeValue = nodeOriginalText.substring(0, matches[0].index);\n")
        output.append("            let prevNode = null;\n")
        output.append("            for (let i = 0; i < matches.length; ++i) {\n")
        output.append("                let code = matches[i].value;\n")
        output.append("                let rjLinkNode = Parser.wrapRJCode(code);\n")
        output.append("                rjLinkNode.innerText = '🔗';\n")
        output.append("                textNode.parentNode.insertBefore(\n")
        output.append("                    rjLinkNode,\n")
        output.append("                    prevNode ? prevNode.nextSibling : textNode.nextSibling,\n")
        output.append("                );\n")
        output.append("                prevNode = rjLinkNode;\n")
        output.append("                rjLinkNode = Parser.wrapPlaceholder(code);\n")
        in_broken = True
    elif in_broken:
        if "textNode.parentNode.insertBefore(" in line:
            in_broken = False
            output.append(line)
        else:
            pass # skip broken lines
    else:
        output.append(line)

with open("c:/Users/Vki/Documents/GitHub/RJ2Link/src/core/parser.ts", "w", encoding="utf-8") as f:
    f.writelines(output)
