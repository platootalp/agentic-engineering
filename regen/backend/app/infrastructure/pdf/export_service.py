"""PDF export service for generating resume PDFs from markdown content."""

import asyncio
import os
from pathlib import Path
from typing import Optional

import markdown
from weasyprint import HTML, CSS


class PDFExportService:
    """Service for exporting resume content to PDF format.

    Supports multiple templates (modern, classic, creative) and handles
    Chinese font rendering with proper page breaks and page numbers.
    """

    def __init__(self, template_dir: Optional[str] = None) -> None:
        """Initialize the PDF export service.

        Args:
            template_dir: Directory containing CSS template files.
                         Defaults to 'templates' subdirectory.
        """
        if template_dir is None:
            self.template_dir = Path(__file__).parent / "templates"
        else:
            self.template_dir = Path(template_dir)

    async def generate_from_markdown(
        self,
        markdown_content: str,
        template_id: str = "modern",
        output_path: Optional[str] = None,
    ) -> bytes:
        """Generate PDF from markdown resume content.

        Args:
            markdown_content: The markdown content to convert.
            template_id: Template style ('modern', 'classic', 'creative').
            output_path: Optional path to save the PDF file.
                        If None, only returns bytes.

        Returns:
            PDF content as bytes.

        Raises:
            ValueError: If template_id is not supported.
            RuntimeError: If PDF generation fails.
        """
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            self._generate_pdf_sync,
            markdown_content,
            template_id,
            output_path,
        )

    def _generate_pdf_sync(
        self,
        markdown_content: str,
        template_id: str,
        output_path: Optional[str],
    ) -> bytes:
        """Synchronous PDF generation (runs in executor).

        Args:
            markdown_content: The markdown content to convert.
            template_id: Template style.
            output_path: Optional path to save the PDF file.

        Returns:
            PDF content as bytes.
        """
        # Convert markdown to HTML
        html_content = self._markdown_to_html(markdown_content, template_id)

        # Get CSS styles
        css_content = self._get_template_css(template_id)

        # Create HTML document
        html_doc = HTML(string=html_content)

        # Create CSS stylesheet
        stylesheet = CSS(string=css_content)

        # Generate PDF
        pdf_bytes = html_doc.write_pdf(stylesheets=[stylesheet])

        # Save to file if path provided
        if output_path:
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, "wb") as f:
                f.write(pdf_bytes)

        return pdf_bytes

    def _get_template_css(self, template_id: str) -> str:
        """Get CSS styles for template.

        Args:
            template_id: Template style identifier.

        Returns:
            CSS stylesheet content.

        Raises:
            ValueError: If template_id is not supported.
        """
        supported_templates = ["modern", "classic", "creative"]

        if template_id not in supported_templates:
            raise ValueError(
                f"Unsupported template: {template_id}. "
                f"Supported: {', '.join(supported_templates)}"
            )

        css_file = self.template_dir / f"{template_id}.css"

        if css_file.exists():
            return css_file.read_text(encoding="utf-8")

        # Fallback to inline CSS if file doesn't exist
        return self._get_default_css(template_id)

    def _get_default_css(self, template_id: str) -> str:
        """Get default inline CSS for template.

        Args:
            template_id: Template style identifier.

        Returns:
            Default CSS stylesheet content.
        """
        base_css = """
        @page {
            size: A4;
            margin: 2cm;
            @bottom-center {
                content: counter(page);
                font-size: 9pt;
                color: #666;
            }
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: "Fira Sans", "Noto Sans CJK SC", "PingFang SC", "Microsoft YaHei", sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }

        h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid;
            margin-top: 1.2em;
            margin-bottom: 0.6em;
        }

        p {
            margin: 0.5em 0;
            orphans: 3;
            widows: 3;
        }

        ul, ol {
            margin: 0.5em 0;
            padding-left: 1.5em;
        }

        li {
            margin: 0.3em 0;
        }

        a {
            color: #2563eb;
            text-decoration: none;
        }

        hr {
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 1.5em 0;
        }

        .page-break {
            page-break-before: always;
        }

        .no-break {
            page-break-inside: avoid;
        }
        """

        template_css = {
            "modern": """
            h1 {
                font-size: 24pt;
                color: #1e40af;
                border-bottom: 2px solid #3b82f6;
                padding-bottom: 0.3em;
            }

            h2 {
                font-size: 14pt;
                color: #1e40af;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            h3 {
                font-size: 12pt;
                color: #374151;
            }

            .section {
                margin-bottom: 1.5em;
            }
            """,
            "classic": """
            body {
                font-family: "Times New Roman", "Noto Serif CJK SC", "SimSun", serif;
            }

            h1 {
                font-size: 22pt;
                color: #000;
                text-align: center;
                border-bottom: 1px solid #000;
                padding-bottom: 0.5em;
            }

            h2 {
                font-size: 13pt;
                color: #000;
                border-bottom: 1px solid #ccc;
                text-transform: uppercase;
            }

            h3 {
                font-size: 11pt;
                font-weight: bold;
            }

            .section {
                margin-bottom: 1.2em;
            }
            """,
            "creative": """
            body {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 1cm;
            }

            .content-wrapper {
                background: white;
                padding: 2cm;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            h1 {
                font-size: 26pt;
                color: #764ba2;
                font-weight: 700;
            }

            h2 {
                font-size: 14pt;
                color: #667eea;
                border-left: 4px solid #764ba2;
                padding-left: 0.5em;
            }

            h3 {
                font-size: 12pt;
                color: #4c1d95;
            }

            .section {
                margin-bottom: 1.5em;
            }

            a {
                color: #764ba2;
            }
            """,
        }

        return base_css + template_css.get(template_id, template_css["modern"])

    def _markdown_to_html(self, markdown_content: str, template_id: str) -> str:
        """Convert markdown to styled HTML.

        Args:
            markdown_content: Raw markdown content.
            template_id: Template style identifier.

        Returns:
            Complete HTML document with styling.
        """
        # Convert markdown to HTML
        html_body = markdown.markdown(
            markdown_content,
            extensions=[
                "markdown.extensions.extra",
                "markdown.extensions.codehilite",
                "markdown.extensions.toc",
                "markdown.extensions.tables",
            ],
        )

        # Wrap content for creative template
        if template_id == "creative":
            html_body = f'<div class="content-wrapper">{html_body}</div>'

        # Build complete HTML document
        html_template = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume</title>
</head>
<body>
    {html_body}
</body>
</html>"""

        return html_template

    def get_available_templates(self) -> list[str]:
        """Get list of available template IDs.

        Returns:
            List of supported template identifiers.
        """
        return ["modern", "classic", "creative"]

    def validate_template(self, template_id: str) -> bool:
        """Check if a template ID is valid.

        Args:
            template_id: Template identifier to validate.

        Returns:
            True if template exists, False otherwise.
        """
        return template_id in self.get_available_templates()
