from PIL import Image
import glob

for file in ["public/brown_tee.png", "public/cream_tee.png"]:
    try:
        img = Image.open(file)
        img = img.convert("RGBA")
        datas = img.getdata()
        
        newData = []
        for item in datas:
            # If the pixel is white or very close to white (assuming white background)
            # or if it's a transparent checkerboard (if the AI drew a literal checkerboard)
            # Let's check the top-left pixel color to determine the background
            pass
            
        # Actually, let's just use a simple threshold for white/light gray
        bg_color = img.getpixel((0, 0))
        # if bg_color is near white or transparent-looking, we remove similar pixels
        # A better approach: remove pixels that match the top-left pixel color closely
        for item in datas:
            if abs(item[0] - bg_color[0]) < 15 and abs(item[1] - bg_color[1]) < 15 and abs(item[2] - bg_color[2]) < 15:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
                
        img.putdata(newData)
        img.save(file.replace(".png", "_transparent.png"), "PNG")
        print(f"Processed {file}")
    except Exception as e:
        print(f"Error processing {file}: {e}")
