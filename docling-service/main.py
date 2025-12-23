from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import os
import tempfile
import logging
from docling.document_converter import DocumentConverter
from docx import Document

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

def _validate_pdf(file: UploadFile):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")


def _validate_docx(file: UploadFile):
    if not file.filename.lower().endswith('.docx'):
        raise HTTPException(status_code=400, detail="Only DOCX files are supported")


async def _save_to_temp(file: UploadFile) -> str:
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
        contents = await file.read()
        tmp_file.write(contents)
        tmp_file.flush()
        return tmp_file.name


def _cleanup_temp(path: str):
    if path and os.path.exists(path):
        os.unlink(path)


def _export_response(result, filename: str):
    markdown_content = result.document.export_to_markdown()
    try:
        json_content = result.document.export_to_dict()
    except Exception as e:  # pragma: no cover - defensive
        logger.warning(f"Failed to export JSON for {filename}: {e}")
        json_content = None

    page_count = len(getattr(result.document, 'pages', [])) if hasattr(result.document, 'pages') else 0

    return JSONResponse({
        "status": "success",
        "filename": filename,
        "markdown": markdown_content,
        "json": json_content,
        "char_count": len(markdown_content),
        "page_count": page_count,
    })


def _docx_to_markdown(path: str) -> str:
    """
    Lightweight DOCX to markdown converter (paragraphs, headings, tables).
    """
    doc = Document(path)
    lines = []

    def add_line(text: str):
        if text is not None:
            lines.append(text.strip())

    for block in doc.element.body:
        if block.tag.endswith('tbl'):  # table
            rows = block.findall('.//w:tr', block.nsmap)
            for row in rows:
                cells = row.findall('.//w:tc', block.nsmap)
                cell_texts = []
                for cell in cells:
                    texts = [t.text for t in cell.findall('.//w:t', block.nsmap) if t.text]
                    cell_texts.append(" ".join(texts))
                if cell_texts:
                    add_line("| " + " | ".join(cell_texts) + " |")
            add_line("")  # spacing after table
        else:  # paragraph
            para = block
            texts = [t.text for t in para.findall('.//w:t', para.nsmap) if t.text]
            text = " ".join(texts).strip()
            if not text:
                add_line("")
                continue

            style = getattr(para, "style", None)
            style_name = getattr(style, "name", "").lower() if style else ""
            if "heading 1" in style_name:
                add_line(f"# {text}")
            elif "heading 2" in style_name:
                add_line(f"## {text}")
            elif "heading 3" in style_name:
                add_line(f"### {text}")
            else:
                add_line(text)

    markdown = "\n".join(lines).strip()
    return markdown


@app.post('/convert-pdf')
async def convert_pdf(file: UploadFile = File(...)):
    """
    Convert PDF to markdown (with best-effort JSON blocks).
    """
    tmp_path = None
    try:
        _validate_pdf(file)
        tmp_path = await _save_to_temp(file)

        logger.info(f"Converting PDF: {file.filename}")
        result = converter.convert(tmp_path)
        logger.info(f"Successfully converted {file.filename}")

        return _export_response(result, file.filename)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error converting PDF: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"PDF conversion failed: {str(e)}")
    finally:
        _cleanup_temp(tmp_path)


@app.post('/convert-pdf-json')
async def convert_pdf_json(file: UploadFile = File(...)):
    """
    Explicit JSON + markdown export endpoint.
    """
    return await convert_pdf(file)


@app.post('/convert-docx')
async def convert_docx(file: UploadFile = File(...)):
    """
    Convert DOCX to markdown (best-effort) with simple JSON summary.
    """
    tmp_path = None
    try:
        _validate_docx(file)
        tmp_path = await _save_to_temp(file)

        logger.info(f"Converting DOCX: {file.filename}")
        markdown_content = _docx_to_markdown(tmp_path)
        logger.info(f"Successfully converted {file.filename}")

        json_content = {
            "status": "parsed",
            "filename": file.filename,
            "char_count": len(markdown_content),
        }

        return JSONResponse({
            "status": "success",
            "filename": file.filename,
            "markdown": markdown_content,
            "json": json_content,
            "char_count": len(markdown_content),
            "page_count": None,
        })
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error converting DOCX: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"DOCX conversion failed: {str(e)}")
    finally:
        _cleanup_temp(tmp_path)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('PORT', 5000))
    host = os.getenv('HOST', '0.0.0.0')
    uvicorn.run(app, host=host, port=port)
