import os

# Small script to bypass the license check for Nuxt UI Pro so a tiny bit illegal but who cares lol
for root, dirs, files in os.walk(r"./node_modules/@nuxt/ui-pro/"):
    for file in files:
        try:
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            if "https://api.nuxtlabs.com/ui-pro/verify" in content:
                new_content = content.replace(
                    "https://api.nuxtlabs.com/ui-pro/verify",
                    "https://postman-echo.com/get"
                )
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(file_path)
        except Exception as e:
            continue
