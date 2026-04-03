import sys

def patch():
    filepath = 'src/components/ClickStory.jsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. hidden variant blur
    content = content.replace("filter: 'blur(5px) brightness(1.2)'", "filter: 'blur(3px)'")

    # 2. exploded variant blur
    content = content.replace("filter: 'blur(12px)'", "filter: 'blur(4px)'")

    # 3. exploded text shadow
    content = content.replace("textShadow: '0 0 30px rgba(255, 250, 240, 0.8)'", "textShadow: '0 0 15px rgba(255, 250, 240, 0.5)'")

    # 4. motion.span style
    content = content.replace(
        "style={{\n                          display: 'inline-block',\n                          color: isFinal ? '#ffe4b5' : '#fffaf0'\n                        }}",
        "style={{\n                          display: 'inline-block',\n                          color: isFinal ? '#ffe4b5' : '#fffaf0',\n                          willChange: 'transform, opacity, filter'\n                        }}"
    )

    # 5. motion.div story-slide style
    content = content.replace(
        "style={{ position: 'absolute', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}",
        "style={{ position: 'absolute', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', willChange: 'opacity, filter' }}"
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Patched ClickStory.jsx")

if __name__ == '__main__':
    patch()