/**
 * @fileoverview Download service for popup
 */

export class DownloadService {
  /**
   * Download markdown content as file
   * @param {string} markdown - Markdown content
   * @param {string} [prefix='boss-jobs'] - Filename prefix
   * @returns {Promise<void>}
   */
  async downloadMarkdown(markdown, prefix = 'boss-jobs') {
    if (!markdown) {
      throw new Error('No content to download');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `${prefix}-${timestamp}.md`;
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    try {
      await chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: false
      });
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      URL.revokeObjectURL(url);
      throw error;
    }
  }
}
