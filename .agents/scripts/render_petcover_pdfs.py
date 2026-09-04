from pathlib import Path

import fitz


INPUT_DIR = Path("attached_assets")
OUTPUT_DIR = Path(".agents/outputs/petcover-pdf-pages")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

for pdf_path in sorted(INPUT_DIR.glob("*.pdf")):
    document = fitz.open(pdf_path)
    print(f"{pdf_path.name}: {document.page_count} pages")
    pdf_output = OUTPUT_DIR / pdf_path.stem
    pdf_output.mkdir(parents=True, exist_ok=True)
    for page_number, page in enumerate(document, start=1):
        text = page.get_text("text").replace("\n", " ").strip()
        print(f"  page {page_number}: {page.rect.width:.0f}x{page.rect.height:.0f}pt text={len(text)} chars")
        pixmap = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
        pixmap.save(pdf_output / f"page-{page_number:03d}.png")