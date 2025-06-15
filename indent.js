/**
 * Compresses multiple spaces into a single space in a string.
 */
function compressSpaces(str) {
    return str.replace(/\s+/g, ' ').trim();
}

/**
 * Finds the next occurrence of either "\begin{" or "\end{" in a string
 * (starting from 'startIndex'), returning the position and which token it is.
 * Returns { pos: -1, token: '' } if neither is found.
 */
function findNextBeginOrEnd(line, startIndex) {
    const idxBegin = line.indexOf('\\begin{', startIndex);
    const idxEnd = line.indexOf('\\end{', startIndex);

    if (idxBegin === -1 && idxEnd === -1) {
        return { pos: -1, token: '' };
    } else if (idxBegin === -1) {
        return { pos: idxEnd, token: '\\end{' };
    } else if (idxEnd === -1) {
        return { pos: idxBegin, token: '\\begin{' };
    } else {
        // Both exist, take whichever is first
        if (idxBegin < idxEnd) {
            return { pos: idxBegin, token: '\\begin{' };
        } else {
            return { pos: idxEnd, token: '\\end{' };
        }
    }
}

/**
 * Parses out "\begin{...}" or "\end{...}" (plus any immediate [blah])
 * from a line, given a known position of the token. Returns:
 *    {
 *       type: 'begin' | 'end',
 *       env: 'environmentName',
 *       bracket: '[optionalStuff]' or ''  (only if type === 'begin')
 *       length: total length of the piece we parsed
 *    }
 * So that the caller knows how many characters we consumed.
 */
function parseBeginOrEnd(line, pos, token) {
    // token is either '\\begin{' or '\\end{'
    const isBegin = token === '\\begin{';

    // First, find the closing '}' that matches the '{' after \begin or \end
    const startEnvName = pos + token.length; // position of environment name
    const closeBrace = line.indexOf('}', startEnvName);
    if (closeBrace === -1) {
        // theoretically can't happen in well-formed LaTeX, but let's handle anyway
        // we will treat the rest as environment name
        const envName = line.substring(startEnvName).trim();
        return {
            type: isBegin ? 'begin' : 'end',
            env: envName,
            bracket: '',
            length: line.length - pos
        };
    }

    // environment name is what's inside the braces
    const envName = line.substring(startEnvName, closeBrace);

    let consumedLength = closeBrace - pos + 1; // length of "\begin{...}" or "\end{...}"
    let bracketContent = '';

    // If this was a \begin, we check if there's an immediate bracket "[...]" right after
    if (isBegin) {
        // skip any spaces after the '}', though typically it should be right away
        let afterClose = closeBrace + 1;
        // If there's immediately a '[', parse everything up to the matching ']'
        if (line[afterClose] === '[') {
            // find the closing ']'
            const closingBracket = line.indexOf(']', afterClose + 1);
            if (closingBracket !== -1) {
                // bracketContent: everything from '[' up to ']'
                bracketContent = line.substring(afterClose, closingBracket + 1); // e.g. "[Some text]"
                consumedLength += (bracketContent.length);
            }
        }
    }

    return {
        type: isBegin ? 'begin' : 'end',
        env: envName,
        bracket: bracketContent,
        length: consumedLength
    };
}

/**
 * Auto-indents LaTeX source code according to the specified rules.
 *
 * @param {string} source - The LaTeX source string.
 * @returns {string} - The properly indented LaTeX code.
 */
function autoIndent(source) {
    // We will tokenize into objects of the form:
    //   { type: 'begin', env: 'something', bracket: '[...]' | '' }
    //   { type: 'end',   env: 'something' }
    //   { type: 'text',  content: 'arbitrary text' }
    //   { type: 'newline' }
    //
    // Then we assemble them with indentation logic.


    // 1) Tokenize the entire source, line by line
    const lines = source.split(/\r?\n/);
    const tokens = [];

    lines.forEach((originalLine) => {
        let line = originalLine;
        let cursor = 0;
        const lineLength = line.length;

        while (cursor < lineLength) {
            // Find the next \begin{ or \end{
            const { pos, token } = findNextBeginOrEnd(line, cursor);

            if (pos === -1) {
                // No more \begin or \end in this line; everything left is text
                const textPart = line.substring(cursor);
                if (textPart.trim().length > 0) {
                    tokens.push({ type: 'text', content: textPart });
                }
                cursor = lineLength;
            } else {
                // We found a \begin or \end
                // 1) everything before pos is text
                const before = line.substring(cursor, pos);
                if (before.trim().length > 0) {
                    tokens.push({ type: 'text', content: before });
                }

                // 2) parse out the begin or end
                const parsed = parseBeginOrEnd(line, pos, token);
                tokens.push({
                    type: parsed.type,   // 'begin' or 'end'
                    env: parsed.env.trim(),
                    bracket: parsed.type === 'begin' ? parsed.bracket : ''
                });

                cursor = pos + parsed.length;
            }
        }

        // At the end of each line, push a newline token
        tokens.push({ type: 'newline' });
    });

    // 2) Rebuild the text with indentation rules
    let output = [];
    let indentation = 0;
    let lastWasNewline = true; // so that if text appears at start, we indent

    // Helper to insert the correct indentation
    function insertIndent() {
        output.push(' '.repeat(indentation * 4));
    }

    // A small helper to decide if an environment is "document"
    function isDocument(envName) {
        return envName.trim().toLowerCase() === 'document';
    }

    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];

        if (t.type === 'newline') {
            output.push('\n');
            lastWasNewline = true;
            continue;
        }

        if (t.type === 'end') {
            // Decrease indentation *before* printing the end, unless it's 'document'
            if (!isDocument(t.env)) {
                indentation = Math.max(0, indentation - 1);
            }
            if (!lastWasNewline) {
                // Force it onto its own line
                output.push('\n');
                lastWasNewline = true;
            }
            insertIndent();
            output.push(`\\end{${t.env}}`);
            lastWasNewline = false;
            continue;
        }

        if (t.type === 'begin') {
            // We put \begin{...} on a new line if needed
            if (!lastWasNewline) {
                output.push('\n');
                lastWasNewline = true;
            }
            // Indent
            insertIndent();

            // e.g. \begin{env}[stuff]
            output.push(`\\begin{${t.env}}${t.bracket}`);
            lastWasNewline = false;

            // Increase indentation *after* printing the begin, unless it's document
            if (!isDocument(t.env)) {
                indentation++;
            }

            continue;
        }

        // Otherwise, it's type === 'text'
        // Compress multiple spaces
        let compressed = compressSpaces(t.content);
        if (compressed.length === 0) {
            // It's possible there's only whitespace. We can skip it or leave one space
            // But we do want to preserve consecutive text tokens in the same line if possible
            continue;
        }

        if (!lastWasNewline) {
            // Force it onto its own line
            output.push('\n');
            lastWasNewline = true;
        }
        insertIndent();

        output.push(compressed);
        lastWasNewline = false;
    }

    // Join everything into a single string
    let finalString = output.join('');

    // The above logic typically ensures we have a trailing newline or not
    // depending on the final tokens. If you prefer always a trailing newline:
    // if (!finalString.endsWith('\n')) finalString += '\n';

    return finalString;
}

// Expose the function to the global window object
window.Indent = {
    autoIndent
};
