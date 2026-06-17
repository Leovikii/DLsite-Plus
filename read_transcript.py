import json

transcript_path = r"C:\Users\Vki\.gemini\antigravity-ide\brain\38095d9d-4497-4533-b3a4-0e81b8e939b4\.system_generated\logs\transcript.jsonl"

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('type') == 'PLANNER_RESPONSE':
                # check if there is a tool call to view_file for parser.ts
                for call in data.get('tool_calls', []):
                    pass
            elif data.get('type') == 'TOOL_RESPONSE' or data.get('type') == 'USER_INPUT':
                if 'parser.ts' in data.get('content', ''):
                    print("Found mention in step:", data.get('step_index'))
                    content = data.get('content', '')
                    if 'walkNodes' in content or 'linkify' in content:
                        print("====================================")
                        print(content[:500])
                        print("...")
        except:
            pass
