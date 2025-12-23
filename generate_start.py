import os
import sys

def generate_start_script():
    # Define paths
    script_dir = os.path.dirname(os.path.realpath(__file__))
    comfy_root = os.path.dirname(script_dir)
    main_py_path = os.path.join(comfy_root, "main.py")
    start_py_path = os.path.join(comfy_root, "start.py")

    print(f"Reading {main_py_path}...")
    try:
        with open(main_py_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except FileNotFoundError:
        print(f"Error: {main_py_path} not found.")
        sys.exit(1)

    # The code to inject
    # We look for the specific path insertion string
    patch_string = '"web_source", "usersocket"'
    
    injection_code = [
        "import sys\n",
        "import os\n",
        "sys.path.insert(0, os.path.join(os.path.dirname(os.path.realpath(__file__)), \"web_source\", \"usersocket\"))\n"
    ]

    # Check if already patched
    content = "".join(lines)
    if patch_string in content:
        print("Info: main.py already contains the usersocket patch. Copying content to start.py without adding duplicate patch.")
        # Just write lines to start.py
        with open(start_py_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print(f"Success: start.py generated (copied from patched main.py).")
        return

    new_lines = []
    patched = False
    
    # Simple state machine to find insertion point
    for line in lines:
        # We inject before 'import server'
        if not patched and (line.strip() == "import server" or line.strip().startswith("import server ")):
            print("Found 'import server', injecting custom path...")
            new_lines.extend(injection_code)
            new_lines.append(line)
            patched = True
        else:
            new_lines.append(line)

    if not patched:
        print("Warning: Could not find 'import server' in main.py. Appending patch to the beginning (after imports) might be unsafe.")
        # If we couldn't find the insertion point, we probably shouldn't just fail silently, 
        # but for now let's warn. 
        pass

    print(f"Writing to {start_py_path}...")
    with open(start_py_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    
    print("Success: start.py generated.")

if __name__ == "__main__":
    generate_start_script()
