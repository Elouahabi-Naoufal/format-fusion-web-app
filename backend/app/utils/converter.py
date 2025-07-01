import os
import time
import random
from PIL import Image
import shutil

class FileConverter:
    def __init__(self):
        self.supported_conversions = {
            # Image conversions
            ('JPG', 'PNG'): self.convert_image,
            ('JPEG', 'PNG'): self.convert_image,
            ('PNG', 'JPG'): self.convert_image,
            ('PNG', 'JPEG'): self.convert_image,
            ('BMP', 'PNG'): self.convert_image,
            ('TIFF', 'JPG'): self.convert_image,
            ('WEBP', 'PNG'): self.convert_image,
            
            # Document conversions (simulated)
            ('PDF', 'DOCX'): self.simulate_conversion,
            ('DOCX', 'PDF'): self.simulate_conversion,
            ('TXT', 'PDF'): self.simulate_conversion,
            ('RTF', 'DOCX'): self.simulate_conversion,
            
            # Audio conversions (simulated)
            ('WAV', 'MP3'): self.simulate_conversion,
            ('MP3', 'WAV'): self.simulate_conversion,
            ('FLAC', 'MP3'): self.simulate_conversion,
            ('AAC', 'MP3'): self.simulate_conversion,
            
            # Video conversions (simulated)
            ('MOV', 'MP4'): self.simulate_conversion,
            ('AVI', 'MP4'): self.simulate_conversion,
            ('WMV', 'MP4'): self.simulate_conversion,
            ('FLV', 'MP4'): self.simulate_conversion,
            
            # Archive conversions (simulated)
            ('ZIP', 'RAR'): self.simulate_conversion,
            ('RAR', 'ZIP'): self.simulate_conversion,
            ('7Z', 'ZIP'): self.simulate_conversion,
            
            # Data conversions (simulated)
            ('CSV', 'XLSX'): self.simulate_conversion,
            ('JSON', 'CSV'): self.simulate_conversion,
            ('XML', 'JSON'): self.simulate_conversion,
        }
    
    def convert_file(self, input_path, from_format, to_format, file_id):
        """Main conversion method"""
        try:
            conversion_key = (from_format.upper(), to_format.upper())
            
            if conversion_key not in self.supported_conversions:
                return False, None, f"Conversion from {from_format} to {to_format} not supported"
            
            # Generate output path
            base_name = os.path.splitext(os.path.basename(input_path))[0]
            output_filename = f"{file_id}_{base_name}.{to_format.lower()}"
            output_path = os.path.join('uploads', 'converted', output_filename)
            
            # Ensure converted directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # Perform conversion
            converter_func = self.supported_conversions[conversion_key]
            success = converter_func(input_path, output_path, from_format, to_format)
            
            if success:
                return True, output_path, None
            else:
                return False, None, "Conversion failed"
                
        except Exception as e:
            return False, None, str(e)
    
    def convert_image(self, input_path, output_path, from_format, to_format):
        """Convert between image formats using PIL"""
        try:
            with Image.open(input_path) as img:
                # Convert RGBA to RGB for JPEG
                if to_format.upper() in ['JPG', 'JPEG'] and img.mode in ['RGBA', 'LA']:
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                    img = background
                
                # Save with appropriate format
                if to_format.upper() in ['JPG', 'JPEG']:
                    img.save(output_path, 'JPEG', quality=95)
                else:
                    img.save(output_path, to_format.upper())
            
            return True
        except Exception as e:
            print(f"Image conversion error: {e}")
            return False
    
    def simulate_conversion(self, input_path, output_path, from_format, to_format):
        """Simulate conversion for formats we don't actually convert"""
        try:
            # Simulate processing time
            time.sleep(random.uniform(2, 8))
            
            # Create a dummy output file by copying the input
            shutil.copy2(input_path, output_path)
            
            # Add some random variation to simulate actual conversion
            if random.random() > 0.1:  # 90% success rate
                return True
            else:
                return False
                
        except Exception as e:
            print(f"Simulation error: {e}")
            return False
    
    def get_supported_formats(self):
        """Return list of supported format conversions"""
        formats = set()
        for from_fmt, to_fmt in self.supported_conversions.keys():
            formats.add(from_fmt)
            formats.add(to_fmt)
        return sorted(list(formats))