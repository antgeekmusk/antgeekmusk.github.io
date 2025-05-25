import os
import re
import requests
from urllib.parse import urlparse

def download_images_from_markdown(file_path):
    # Ensure the file exists
    if not os.path.isfile(file_path):
        print(f"File not found: {file_path}")
        return

    # Read the Markdown file
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    # Regex to find all image URLs in Markdown
    image_pattern = r'!\[.*?\]\((https?://[^\s)]+)\)'
    matches = re.findall(image_pattern, content)

    # Directory to save images
    file_dir = os.path.dirname(file_path)

    for url in matches:
        try:
            # Parse the image name from the URL
            parsed_url = urlparse(url)
            image_name = os.path.basename(parsed_url.path)

            # Local path to save the image
            local_image_path = os.path.join(file_dir, image_name)

            # Download the image
            response = requests.get(url, stream=True)
            if response.status_code == 200:
                with open(local_image_path, 'wb') as img_file:
                    for chunk in response.iter_content(1024):
                        img_file.write(chunk)
                print(f"Downloaded: {url} -> {local_image_path}")
            else:
                print(f"Failed to download: {url} (Status code: {response.status_code})")
                continue

            # Replace the URL in the Markdown content with the local path
            content = content.replace(url, image_name)

        except Exception as e:
            print(f"Error processing {url}: {e}")

    # Write the updated content back to the Markdown file
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)
    print(f"Updated Markdown file: {file_path}")

if __name__ == '__main__':
    pass
    download_images_from_markdown('/Users/fujunhua/IdeaProjects/antgeekmusk.github.io/public/data/blog/content/20250521/2/Hive 表类型.md')
