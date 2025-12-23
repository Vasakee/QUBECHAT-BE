from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import os
import tempfile
import logging
from pathlib import Path
from docling.document_converter import DocumentConverter

# Setup logging
logging.basicConfig(level=os.getenv('LOG_LEVEL', 'INFO'))
logger = logging.getLogger(__name__)

app = FastAPI(title="Docling PDF Processing Service", version="1.0.0")

# Initialize Docling converter
converter = DocumentConverter()

@app.get('/health')
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "docling"}

@app.get('/info')
async def service_info():
    """Service information endpoint"""
    return {
        "service": "Docling PDF Processing",
        "version": "1.0.0",
        "capabilities": ["pdf_to_markdown", "pdf_to_json"],
        "status": "running"
    }

@app.post('/convert-pdf')
async def convert_pdf(file: UploadFile = File(...)):
    """
    Convert PDF to markdown
    
    Args:
        file: PDF file to convert
        
    Returns:
        JSON with extracted markdown and metadata
    """
    try:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        # Save uploaded file to temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            contents = await file.read()
            tmp_file.write(contents)
            tmp_file.flush()
            tmp_path = tmp_file.name
        
        try:
            # Convert PDF to markdown
            logger.info(f"Converting PDF: {file.filename}")
            result = converter.convert(tmp_path)
            
            # Extract markdown from result
            markdown_content = result.document.export_to_markdown()
            
            logger.info(f"Successfully converted {file.filename} ({len(markdown_content)} chars)")
            
            return JSONResponse({
                "status": "success",
                "filename": file.filename,
                "markdown": markdown_content,
                "char_count": len(markdown_content),
                "page_count": result.document.pages.__len__() if hasattr(result.document, 'pages') else 0
            })
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error converting PDF: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"PDF conversion failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('PORT', 5000))
    host = os.getenv('HOST', '0.0.0.0')
    uvicorn.run(app, host=host, port=port)
