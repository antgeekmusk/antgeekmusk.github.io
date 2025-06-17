import os
import re
import requests
from urllib.parse import urlparse


def download_images_from_markdown(file_path):
    """
    将网络路径转换成本地路径
    :param file_path:
    :return:
    """
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


def remove_font_tags_from_markdown(file_path):
    """
    去除 Markdown 文件中的 <font> 标签
    :param file_path: Markdown 文件路径
    """
    # Ensure the file exists
    if not os.path.isfile(file_path):
        print(f"File not found: {file_path}")
        return

    # Read the Markdown file
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    # Regex to remove <font> tags and their attributes
    content = re.sub(r'<font[^>]*>', '', content)  # Remove opening <font> tags
    content = re.sub(r'</font>', '', content)  # Remove closing </font> tags

    # Write the updated content back to the Markdown file
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)

    print(f"Removed <font> tags from: {file_path}")


def remove_irregular_format(file_path):
    """
    去除 Markdown 文件中的不规则格式
    :param file_path: Markdown 文件路径
    """
    # Ensure the file exists
    if not os.path.isfile(file_path):
        print(f"File not found: {file_path}")
        return

    # Read the Markdown file
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    content = re.sub(r'\*\*,(.*?)\*\*', r',**\1**', content)
    content = re.sub(r'\*\*(.*?),\*\*', r'**\1**', content)
    content = content.replace('** ', '**')
    content = content.replace(' **', '**')
    content = content.replace('****', '** **')


    # Write the updated content back to the Markdown file
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)

    print(f"Removed irregular formats from: {file_path}")

def run(file_path):
    """
    主函数，执行所有操作
    """
    # 将图片的网络路径转换成本地路径
    download_images_from_markdown(file_path)
    # 去除 Markdown 文件中的 <font> 标签
    remove_font_tags_from_markdown(file_path)
    # 去除 Markdown 文件中的不规则格式
    remove_irregular_format(file_path)

if __name__ == '__main__':
    pass
    file_path = '/public/data/blog/content/20250617/8/flinkcdc 3.0 架构设计学习.md'
    run(file_path)
