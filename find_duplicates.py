import re

def find_duplicates(filename):
    with open(filename, 'r') as f:
        lines = f.readlines()

    # Find en block
    en_start = -1
    en_end = -1
    for i, line in enumerate(lines):
        if 'en: {' in line:
            en_start = i
        if 'zh: {' in line:
            en_end = i
            break
    
    if en_start != -1 and en_end != -1:
        print(f"EN block: {en_start+1} to {en_end}")
        en_keys = {}
        for i in range(en_start + 1, en_end):
            match = re.search(r'"([^"]+)":', lines[i])
            if match:
                key = match.group(1)
                if key in en_keys:
                    en_keys[key].append(i + 1)
                else:
                    en_keys[key] = [i + 1]
        
        for key, line_nums in en_keys.items():
            if len(line_nums) > 1:
                print(f"Duplicate key in EN: {key} at lines {line_nums}")

    # Find zh block
    zh_start = en_end
    zh_end = len(lines)
    if zh_start != -1:
        print(f"ZH block: {zh_start+1} to {zh_end}")
        zh_keys = {}
        for i in range(zh_start + 1, zh_end):
            match = re.search(r'"([^"]+)":', lines[i])
            if match:
                key = match.group(1)
                if key in zh_keys:
                    zh_keys[key].append(i + 1)
                else:
                    zh_keys[key] = [i + 1]
        
        for key, line_nums in zh_keys.items():
            if len(line_nums) > 1:
                print(f"Duplicate key in ZH: {key} at lines {line_nums}")

find_duplicates('src/i18n.ts')
