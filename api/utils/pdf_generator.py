from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import simpleSplit
import io

def generate_pdf_buffer(content, title="Document"):
    """
    Generates a PDF from the given text content and returns it as a BytesIO buffer.
    """
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Title
    p.setFont("Helvetica-Bold", 16)
    p.drawString(72, height - 72, title)
    
    # Content
    p.setFont("Helvetica", 12)
    y = height - 100
    margin = 72
    line_height = 14
    
    # Simple text wrapping
    max_width = width - 2 * margin
    
    for line in content.split('\n'):
        # Split long lines
        wrapped_lines = simpleSplit(line, "Helvetica", 12, max_width)
        
        for wrapped_line in wrapped_lines:
            if y < 72:
                p.showPage()
                y = height - 72
                p.setFont("Helvetica", 12)
            
            p.drawString(margin, y, wrapped_line)
            y -= line_height
            
    p.showPage()
    p.save()
    
    buffer.seek(0)
    return buffer
