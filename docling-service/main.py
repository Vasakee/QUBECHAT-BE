from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import os
import tempfile
import logging
import PyPDF2
import traceback
from pdf2image import convert_from_path
import pytesseract
from PIL import Image

logging.basicConfig(level=os.getenv('LOG_LEVEL', 'INFO'))
logger = logging.getLogger(__name__)

app = FastAPI(title="Docling Service", version="1.0.0")

# No persistent OCR reader needed for pytesseract


@app.get('/health')
async def health_check():
    return {"status": "ok", "service": "docling"}


@app.get('/info')
async def info():
    return {"service": "docling", "version": "1.0.0", "capabilities": ["pdf_to_markdown", "text_extraction", "ocr"]}


async def _save_tmp(file: UploadFile) -> str:
    suffix = os.path.splitext(file.filename)[1] or '.bin'
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as f:
        contents = await file.read()
        f.write(contents)
        return f.name


def _extract_text_from_pdf(filepath: str):
    """Extract text from PDF and return (text, page_count, method)"""
    try:
        logger.info(f"Opening PDF file: {filepath}")
        with open(filepath, 'rb') as f:
            pdf_reader = PyPDF2.PdfReader(f)
            page_count = len(pdf_reader.pages)
            logger.info(f"PDF has {page_count} pages")
            text_parts = []
            
            for page_num, page in enumerate(pdf_reader.pages, 1):
                try:
                    text = page.extract_text()
                    if text and text.strip():
                        # Format as markdown with page headers
                        text_parts.append(f"## Page {page_num}\n\n{text}\n")
                except Exception as e:
                    logger.warning(f"Failed to extract text from page {page_num}: {str(e)}")
                    continue
            
            full_text = "".join(text_parts)
            if full_text.strip():
                logger.info(f"Extracted {len(full_text)} characters via PyPDF2 from {page_count} pages")
                return full_text, page_count, "text-extraction"
            else:
                logger.warning("No text found via PyPDF2, will try OCR fallback")
                return None, page_count, None
    except Exception as e:
        logger.error(f"PDF extraction error: {str(e)}")
        logger.error(traceback.format_exc())
        return None, None, None


def _extract_text_via_ocr(filepath: str):
    """Extract text from PDF using OCR (image-based PDFs)"""
    try:
        logger.info("Converting PDF to images for OCR...")
        images = convert_from_path(filepath, first_page=1, last_page=10)  # Limit to first 10 pages for speed
        logger.info(f"Converted to {len(images)} images")
        
        text_parts = []

        for page_num, image in enumerate(images, 1):
            logger.info(f"Running OCR on page {page_num}...")
            try:
                # pdf2image returns PIL Images; use pytesseract to extract text
                page_text = pytesseract.image_to_string(image, lang='eng')
            except Exception:
                page_text = ''

            if page_text and page_text.strip():
                text_parts.append(f"## Page {page_num} (OCR)\n\n{page_text}\n")
        
        full_text = "".join(text_parts)
        logger.info(f"Extracted {len(full_text)} characters via OCR from {len(images)} pages")
        return full_text, (len(images) if full_text.strip() else None)
    except Exception as e:
        logger.error(f"OCR extraction error: {str(e)}")
        logger.error(traceback.format_exc())
        return None, None


@app.post('/convert-pdf')
async def convert_pdf(file: UploadFile = File(...)):
    tmp = None
    try:
        logger.info(f"Received file: {file.filename} (size: {file.size} bytes)")
        tmp = await _save_tmp(file)
        logger.info(f"Saved to temp file: {tmp}")
        logger.info(f"Converting PDF: {file.filename}")
        
        # Try text extraction first
        text, page_count, method = _extract_text_from_pdf(tmp)
        
        # If no text, try OCR
        if not text:
            logger.info("Text extraction failed, trying OCR...")
            text, page_count = _extract_text_via_ocr(tmp)
            method = "ocr"
        
        if not text:
            # If still no text found, return error
            logger.warning(f"Could not extract text from PDF: {file.filename}")
            return JSONResponse({
                "status": "error",
                "filename": file.filename,
                "error": "Could not extract text. PDF may be corrupted or unreadable.",
                "page_count": page_count,
            }, status_code=400)
        
        # Format as markdown
        md = f"# {file.filename}\n\n{text}"
        
        logger.info(f"Successfully converted {file.filename} ({page_count} pages, {len(md)} chars, method: {method})")
        return JSONResponse({
            "status": "success",
            "filename": file.filename,
            "markdown": md,
            "char_count": len(md),
            "page_count": page_count,
            "extraction_method": method,
        })
    except Exception as e:
        logger.error(f"Error converting PDF: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse({
            "status": "error",
            "filename": file.filename,
            "error": str(e),
        }, status_code=500)
    finally:
        if tmp and os.path.exists(tmp):
            try:
                os.unlink(tmp)
                logger.info(f"Cleaned up temp file: {tmp}")
            except Exception as e:
                logger.warning(f"Failed to delete temp file: {str(e)}")


if __name__ == '__main__':
    import uvicorn
    port = int(os.getenv('PORT', 5000))
    uvicorn.run(app, host='0.0.0.0', port=port)



if __name__ == '__main__':
    import uvicorn
    port = int(os.getenv('PORT', 5000))
    uvicorn.run(app, host='0.0.0.0', port=port)



if __name__ == '__main__':
    import uvicorn
    port = int(os.getenv('PORT', 5000))
    uvicorn.run(app, host='0.0.0.0', port=port)
