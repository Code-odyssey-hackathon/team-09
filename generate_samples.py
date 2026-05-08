"""Generate sample leaf images for testing."""
from PIL import Image, ImageDraw, ImageFilter
import os
import random

def create_leaf_image(filename, stress_type):
    """Create a synthetic leaf image for a given stress type."""
    width, height = 400, 300
    img = Image.new('RGB', (width, height), color=(240, 245, 240))
    draw = ImageDraw.Draw(img, 'RGBA')
    
    # Base leaf shape and colors by stress type
    leaf_colors = {
        'healthy': [(34, 139, 34), (50, 150, 50), (60, 160, 60)],
        'drought': [(200, 180, 100), (180, 160, 80), (160, 140, 60)],
        'nutrient': [(180, 200, 100), (160, 180, 80), (200, 120, 50)],
        'pest': [(100, 150, 80), (80, 130, 60), (120, 80, 40)],
        'fungal': [(150, 100, 100), (180, 120, 120), (200, 140, 140)],
    }
    
    colors = leaf_colors.get(stress_type, leaf_colors['healthy'])
    
    # Draw leaf veins
    draw.line([(200, 50), (200, 250)], fill=(100, 100, 100), width=2)
    for i in range(80, 250, 20):
        draw.line([(200, 100 + (i-80)//2), (150 - (i-80)//3, 100 + (i-80)//2)], 
                 fill=(120, 120, 120), width=1)
        draw.line([(200, 100 + (i-80)//2), (250 + (i-80)//3, 100 + (i-80)//2)], 
                 fill=(120, 120, 120), width=1)
    
    # Draw leaf shape
    leaf_coords = [
        (200, 50), (180, 100), (170, 150), (175, 200), (200, 250),
        (225, 200), (230, 150), (220, 100)
    ]
    draw.polygon(leaf_coords, fill=colors[0], outline=(50, 50, 50))
    
    # Add stress indicators
    if stress_type == 'drought':
        # Add wrinkles/stress lines
        for _ in range(8):
            x = random.randint(170, 230)
            y = random.randint(100, 200)
            draw.line([(x, y), (x+10, y+5)], fill=(200, 180, 100), width=1)
    
    elif stress_type == 'nutrient':
        # Add yellowing/purpling spots
        for _ in range(6):
            x = random.randint(180, 220)
            y = random.randint(100, 200)
            draw.ellipse([(x-8, y-8), (x+8, y+8)], fill=(200, 180, 80, 100))
    
    elif stress_type == 'pest':
        # Add holes and damage
        for _ in range(5):
            x = random.randint(180, 220)
            y = random.randint(100, 200)
            draw.ellipse([(x-5, y-5), (x+5, y+5)], fill=(100, 100, 100))
    
    elif stress_type == 'fungal':
        # Add spots
        for _ in range(10):
            x = random.randint(180, 220)
            y = random.randint(100, 200)
            size = random.randint(3, 8)
            draw.ellipse([(x-size, y-size), (x+size, y+size)], fill=(180, 100, 100, 120))
    
    # Add slight blur for realism
    img = img.filter(ImageFilter.GaussianBlur(radius=0.5))
    img.save(filename)
    print(f"✓ Created {filename}")

# Create output directory
os.makedirs('public/samples', exist_ok=True)

# Generate test images
stress_types = ['healthy', 'drought', 'nutrient', 'pest', 'fungal']
for stress in stress_types:
    filename = f'public/samples/leaf-{stress}.png'
    create_leaf_image(filename, stress)

print("\n✅ Sample leaf images created in public/samples/")
