# DeToX - LaTeX document sanitizer

DeToX is a web-based tool for standardizing and cleaning LaTeX documents. 
DeToX helps you transform LaTeX files by normalizing equation formatting, reference styles, and code indentation according to your preferences.

## Features

### Display equation standardization
Transform between different display equation formats:
- `$$...$$` (dollar signs)
- `\[...\]` (square brackets) 
- `\begin{equation*}...\end{equation*}` (equation environment)

### Equation reference formatting
Normalize equation references:
- Convert `\eqref{...}` to `(\ref{...})`
- Convert `(\ref{...})` to `\eqref{...}`

### Auto-indentation
Automatically indent LaTeX code for better readability, handling:
- Environment nesting (`\begin{...}` and `\end{...}`)
- Proper spacing and structure

## Usage

1. **Open the tool**: Open `index.html` in your web browser
2. **Provide LaTeX source**: 
   - **Option 1**: Upload your LaTeX (.tex) file using the file picker
   - **Option 2**: Paste your LaTeX source directly into the textarea
3. **Configure options**: 
   - Choose your preferred display equation format
   - Select equation reference style
   - Enable auto-indentation if desired
4. **Transform**: Click "Transform LaTeX" to process your source
5. **Get results**: 
   - View the transformed LaTeX in the output textarea
   - **Download**: Save the sanitized file as `sanitized.tex`
   - **Copy**: Copy the transformed LaTeX to your clipboard for pasting elsewhere

## Technical Details

- **Frontend**: Pure HTML/CSS/JavaScript with Bootstrap 5 for styling
- **File processing**: Client-side file reading and processing (no server required)
- **LaTeX parsing**: Custom parsers for handling nested environments and bracket matching

## Getting Started

No installation required! Simply:
1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. Start sanitizing your LaTeX files

## License

See `LICENSE` file for details.
