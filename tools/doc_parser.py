import asyncio
import logging
from pathlib import Path
from config import MAX_FILE_SIZE_MB, MAX_PDF_PAGES, PARSE_TIMEOUT_SEC, ALLOWED_EXTENSIONS

logger = logging.getLogger(__name__)


class ParseError(Exception):
    """文档解析错误"""
    pass


async def parse_document(file_path: str, original_filename: str) -> str:
    """解析文档文件，返回纯文本内容。"""
    ext = Path(original_filename).suffix.lower().lstrip(".")

    if ext not in ALLOWED_EXTENSIONS:
        raise ParseError(
            f"不支持的文件格式 .{ext}。支持的格式：{', '.join(ALLOWED_EXTENSIONS)}"
        )

    file_size = Path(file_path).stat().st_size
    if file_size > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise ParseError(f"文件过大（上限 {MAX_FILE_SIZE_MB}MB），请压缩后重试")

    try:
        text = await asyncio.wait_for(
            _parse_by_ext(file_path, ext),
            timeout=PARSE_TIMEOUT_SEC,
        )
        return _truncate_if_needed(text)
    except asyncio.TimeoutError:
        raise ParseError("文档解析超时，文件可能过大或格式异常，请尝试分批处理")


async def _parse_by_ext(file_path: str, ext: str) -> str:
    if ext == "txt":
        return await _parse_txt(file_path)
    elif ext == "md":
        return await _parse_txt(file_path)
    elif ext == "docx":
        return await _parse_docx(file_path)
    elif ext == "pdf":
        return await _parse_pdf(file_path)
    else:
        raise ParseError(f"未实现的解析器: .{ext}")


async def _parse_txt(file_path: str) -> str:
    for encoding in ["utf-8", "gbk", "gb2312"]:
        try:
            with open(file_path, encoding=encoding) as f:
                return f.read()
        except UnicodeDecodeError:
            continue
    raise ParseError("无法识别文件编码，请转换为 UTF-8 格式后重试")


async def _parse_docx(file_path: str) -> str:
    from docx import Document

    doc = Document(file_path)
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n\n".join(paragraphs)


async def _parse_pdf(file_path: str) -> str:
    import pdfplumber

    with pdfplumber.open(file_path) as pdf:
        if len(pdf.pages) > MAX_PDF_PAGES:
            raise ParseError(
                f"PDF 页数超过上限（{MAX_PDF_PAGES}页），请分批上传"
            )
        texts = []
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                texts.append(page_text)
        return "\n\n".join(texts)


def _truncate_if_needed(text: str, max_chars: int = 30000) -> str:
    if len(text) > max_chars:
        return text[:max_chars] + "\n\n...（文档过长，已截取前 30000 字）"
    return text
