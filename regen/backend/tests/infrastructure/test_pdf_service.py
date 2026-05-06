"""Tests for PDF Export Service."""

from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from app.infrastructure.pdf.export_service import PDFExportService


class TestPDFExportService:
    """Tests for PDFExportService class."""

    @pytest.fixture
    def service(self):
        """Create a PDF export service instance."""
        return PDFExportService()

    @pytest.fixture
    def sample_markdown(self):
        """Sample markdown content for testing."""
        return """
# John Doe

## Contact Information
- Email: john@example.com
- Phone: +86 13800138000

## Experience

### Software Engineer at Tech Corp
*2020 - Present*

- Developed scalable web applications
- Led team of 5 developers

## Skills
- Python
- FastAPI
- PostgreSQL
"""

    def test_initialization_default_template_dir(self):
        """Test initialization with default template directory."""
        service = PDFExportService()
        assert service.template_dir is not None
        assert isinstance(service.template_dir, Path)

    def test_initialization_custom_template_dir(self, tmp_path):
        """Test initialization with custom template directory."""
        custom_dir = tmp_path / "custom_templates"
        custom_dir.mkdir()
        service = PDFExportService(template_dir=str(custom_dir))
        assert service.template_dir == custom_dir

    def test_get_available_templates(self, service):
        """Test getting available templates."""
        templates = service.get_available_templates()
        assert isinstance(templates, list)
        assert "modern" in templates
        assert "classic" in templates
        assert "creative" in templates
        assert len(templates) == 3

    def test_validate_template_valid(self, service):
        """Test validating valid templates."""
        assert service.validate_template("modern") is True
        assert service.validate_template("classic") is True
        assert service.validate_template("creative") is True

    def test_validate_template_invalid(self, service):
        """Test validating invalid templates."""
        assert service.validate_template("invalid") is False
        assert service.validate_template("") is False
        assert service.validate_template("unknown") is False

    @pytest.mark.asyncio
    async def test_generate_from_markdown_success(self, service, sample_markdown):
        """Test successful PDF generation from markdown."""
        mock_pdf_bytes = b"mock pdf content"

        with patch.object(service, "_generate_pdf_sync", return_value=mock_pdf_bytes):
            result = await service.generate_from_markdown(
                markdown_content=sample_markdown,
                template_id="modern",
            )

        assert result == mock_pdf_bytes

    @pytest.mark.asyncio
    async def test_generate_from_markdown_with_output_path(self, service, sample_markdown, tmp_path):
        """Test PDF generation with output path."""
        mock_pdf_bytes = b"mock pdf content"
        output_path = tmp_path / "output" / "resume.pdf"

        with patch.object(service, "_generate_pdf_sync", return_value=mock_pdf_bytes):
            result = await service.generate_from_markdown(
                markdown_content=sample_markdown,
                template_id="modern",
                output_path=str(output_path),
            )

        assert result == mock_pdf_bytes
        assert output_path.exists()
        assert output_path.read_bytes() == mock_pdf_bytes

    @pytest.mark.asyncio
    async def test_generate_from_markdown_invalid_template(self, service, sample_markdown):
        """Test PDF generation with invalid template."""
        with pytest.raises(ValueError, match="Unsupported template"):
            await service.generate_from_markdown(
                markdown_content=sample_markdown,
                template_id="invalid_template",
            )

    def test_get_template_css_valid_template(self, service):
        """Test getting CSS for valid templates."""
        for template_id in ["modern", "classic", "creative"]:
            css = service._get_template_css(template_id)
            assert isinstance(css, str)
            assert len(css) > 0
            assert "@page" in css

    def test_get_template_css_invalid_template(self, service):
        """Test getting CSS for invalid template."""
        with pytest.raises(ValueError, match="Unsupported template"):
            service._get_template_css("invalid_template")

    def test_get_default_css_contains_base_styles(self, service):
        """Test that default CSS contains base styles."""
        css = service._get_default_css("modern")
        assert "@page" in css
        assert "body" in css
        assert "h1" in css
        assert "h2" in css

    def test_get_default_css_different_templates(self, service):
        """Test that different templates have different styles."""
        modern_css = service._get_default_css("modern")
        classic_css = service._get_default_css("classic")
        creative_css = service._get_default_css("creative")

        # Each template should have unique styling
        assert modern_css != classic_css
        assert modern_css != creative_css
        assert classic_css != creative_css

        # Classic should use serif fonts
        assert "Times New Roman" in classic_css or "Noto Serif" in classic_css

        # Creative should have gradient background
        assert "gradient" in creative_css

    def test_markdown_to_html_conversion(self, service, sample_markdown):
        """Test markdown to HTML conversion."""
        html = service._markdown_to_html(sample_markdown, "modern")

        assert "<!DOCTYPE html>" in html
        assert "<html" in html
        assert "<body>" in html
        assert "John Doe" in html
        assert "Software Engineer" in html
        assert "</html>" in html

    def test_markdown_to_html_with_creative_template(self, service, sample_markdown):
        """Test markdown to HTML conversion with creative template."""
        html = service._markdown_to_html(sample_markdown, "creative")

        assert "content-wrapper" in html

    def test_markdown_to_html_preserves_structure(self, service):
        """Test that markdown structure is preserved in HTML."""
        markdown = "# Heading\n\nParagraph text\n\n- Item 1\n- Item 2"
        html = service._markdown_to_html(markdown, "modern")

        assert "<h1>Heading</h1>" in html
        assert "<p>Paragraph text</p>" in html
        assert "<ul>" in html
        assert "<li>Item 1</li>" in html
        assert "<li>Item 2</li>" in html

    def test_markdown_to_html_with_tables(self, service):
        """Test markdown tables conversion."""
        markdown = """
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
"""
        html = service._markdown_to_html(markdown, "modern")

        assert "<table>" in html
        assert "<th>Header 1</th>" in html
        assert "<td>Cell 1</td>" in html

    def test_generate_pdf_sync(self, service, sample_markdown):
        """Test synchronous PDF generation."""
        mock_html = MagicMock()
        mock_css = MagicMock()
        mock_pdf_bytes = b"generated pdf bytes"

        with patch("app.infrastructure.pdf.export_service.HTML", return_value=mock_html) as mock_html_class:
            with patch("app.infrastructure.pdf.export_service.CSS", return_value=mock_css) as mock_css_class:
                mock_html.write_pdf.return_value = mock_pdf_bytes

                result = service._generate_pdf_sync(sample_markdown, "modern", None)

                assert result == mock_pdf_bytes
                mock_html_class.assert_called_once()
                mock_css_class.assert_called_once()
                mock_html.write_pdf.assert_called_once_with(stylesheets=[mock_css])

    def test_generate_pdf_sync_with_output(self, service, sample_markdown, tmp_path):
        """Test synchronous PDF generation with file output."""
        output_path = tmp_path / "test_resume.pdf"
        mock_pdf_bytes = b"generated pdf bytes"

        with patch("app.infrastructure.pdf.export_service.HTML") as mock_html_class:
            with patch("app.infrastructure.pdf.export_service.CSS"):
                mock_html = MagicMock()
                mock_html.write_pdf.return_value = mock_pdf_bytes
                mock_html_class.return_value = mock_html

                result = service._generate_pdf_sync(
                    sample_markdown, "modern", str(output_path)
                )

                assert result == mock_pdf_bytes
                assert output_path.exists()
                assert output_path.read_bytes() == mock_pdf_bytes


class TestPDFExportServiceEdgeCases:
    """Tests for edge cases and error handling."""

    @pytest.fixture
    def service(self):
        """Create a PDF export service instance."""
        return PDFExportService()

    def test_empty_markdown(self, service):
        """Test handling of empty markdown."""
        html = service._markdown_to_html("", "modern")
        assert "<!DOCTYPE html>" in html
        assert "<body>" in html

    def test_markdown_with_special_characters(self, service):
        """Test markdown with special characters."""
        markdown = "# Test: Special <chars> & symbols"
        html = service._markdown_to_html(markdown, "modern")
        assert "Test: Special" in html

    def test_markdown_with_chinese_characters(self, service):
        """Test markdown with Chinese characters."""
        markdown = "# 简历\n\n姓名：张三"
        html = service._markdown_to_html(markdown, "modern")
        assert "简历" in html
        assert "张三" in html

    def test_template_css_file_not_exists_uses_default(self, service, tmp_path):
        """Test that default CSS is used when template file doesn't exist."""
        service.template_dir = tmp_path  # Empty directory

        css = service._get_template_css("modern")
        assert isinstance(css, str)
        assert "@page" in css

    def test_template_css_file_exists(self, service, tmp_path):
        """Test reading CSS from existing template file."""
        service.template_dir = tmp_path
        css_content = "/* Custom CSS */\nbody { color: red; }"
        (tmp_path / "modern.css").write_text(css_content)

        css = service._get_template_css("modern")
        assert css == css_content
