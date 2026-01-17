/**
 * Strips HTML tags and checks if the content is empty
 * React Quill returns '<p><br></p>' for empty editors
 * This function returns an empty string if there's no actual text content
 */
export const stripEmptyHtml = (html: string | undefined): string => {
    if (!html) return '';

    // Remove all HTML tags
    const text = html.replace(/<[^>]*>/g, '');

    // Remove whitespace and check if empty
    const trimmed = text.trim();

    // If there's no actual text content, return empty string
    // Otherwise return the original HTML
    return trimmed.length === 0 ? '' : html;
};

/**
 * Gets plain text from HTML (for character counting)
 */
export const getPlainTextFromHtml = (html: string | undefined): string => {
    if (!html) return '';

    // Remove all HTML tags
    const text = html.replace(/<[^>]*>/g, '');

    // Decode HTML entities
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;

    return textarea.value.trim();
};
