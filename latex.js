// Core LaTeX manipulation library

/**
 * Extracts content between matching brackets from a source string.
 *
 * @param {string} source - The source string.
 * @param {number} index - The starting index (after the opening bracket).
 * @param {string} [openChar='{'] - The opening bracket character.
 * @param {string} [closeChar='}'] - The closing bracket character.
 * @returns {{content: string, newIndex: number}} - The extracted content and updated index.
 */
function parseBracketedContent(source, index, openChar = '{', closeChar = '}') {
    let braceDepth = 1;
    const start = index;
    while (index < source.length && braceDepth > 0) {
        if (source[index] === openChar) {
            braceDepth++;
        } else if (source[index] === closeChar) {
            braceDepth--;
        }
        index++;
    }
    return { content: source.substring(start, index - 1), newIndex: index };
}

/**
 * Transforms '\\eqref{...}' into '(\\ref{...})' within a LaTeX source string.
 *
 * @param {string} source - The LaTeX source string.
 * @returns {string} - The transformed string.
 */
function transformEqToParenRef(source) {
    let result = '';
    let i = 0;
    while (i < source.length) {
        if (source.startsWith('\\eqref{', i)) {
            i += 7;
            const { content, newIndex } = parseBracketedContent(source, i);
            i = newIndex;
            result += `(\\ref{${content}})`;
        } else {
            result += source[i];
            i++;
        }
    }
    return result;
}

/**
 * Transforms '(\\ref{...})' into '\\eqref{...}' within a LaTeX source string.
 *
 * @param {string} source - The LaTeX source string.
 * @returns {string} - The transformed string.
 */
function transformParenRefToEq(source) {
    let result = '';
    let i = 0;
    while (i < source.length) {
        if (
            source[i] === '(' &&
            i + 5 < source.length &&
            source.substring(i, i + 5) === '(\\ref' &&
            source[i + 5] === '{'
        ) {
            i += 6;
            const { content, newIndex } = parseBracketedContent(source, i);
            i = newIndex;
            if (i < source.length && source[i] === ')') {
                i++;
                result += `\\eqref{${content}}`;
            } else {
                result += `(\\ref{${content}`;
            }
        } else {
            result += source[i];
            i++;
        }
    }
    return result;
}

/**
 * Replaces LaTeX display math delimiters with new specified delimiters.
 *
 * @param {string} source - The LaTeX source string.
 * @param {string} newOpen - The new opening delimiter.
 * @param {string} newClose - The new closing delimiter.
 * @returns {string} - The modified string.
 */
function transformDisplay(source, newOpen, newClose) {
    const patterns = [
        { start: '\\[', end: '\\]' },
        { start: '\\begin{equation*}', end: '\\end{equation*}' },
        { start: '$$', end: '$$' }
    ];
    let result = '';
    let i = 0;
    while (i < source.length) {
        let matched = false;
        for (const { start, end } of patterns) {
            if (source.startsWith(start, i)) {
                result += newOpen;
                i += start.length;
                let content = '';
                while (i < source.length && !source.startsWith(end, i)) {
                    content += source[i];
                    i++;
                }
                if (i < source.length) {
                    i += end.length;
                }
                result += content + newClose;
                matched = true;
                break;
            }
        }
        if (!matched) {
            result += source[i];
            i++;
        }
    }
    return result;
}

/**
 * Auto-indents LaTeX source code by calling the external function.
 *
 * @param {string} source - The LaTeX source string.
 * @returns {string} - The indented string.
 */
function autoIndent(source) {
    // Use the externalized indentation function
    return window.Indent.autoIndent(source);
}

// Expose functions to the global window object
window.Latex = {
    transformEqToParenRef,
    transformParenRefToEq,
    transformDisplay,
    autoIndent
};
