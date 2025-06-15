// We'll keep two global variables to store the file text.
let originalText = '';
let transformedText = '';

// References to HTML elements
const fileInput    = document.getElementById('fileInput');
const fileStatus   = document.getElementById('fileStatus');
const sanitizeBtn  = document.getElementById('sanitizeBtn');
const transformMsg = document.getElementById('transformMsg');
const downloadBtn  = document.getElementById('downloadBtn');

// ---------------------------
// 1. FILE READING
// ---------------------------
fileInput.addEventListener('change', function() {
  const file = fileInput.files[0];
  if (!file) {
    fileStatus.textContent = 'No file loaded.';
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    originalText = e.target.result;
    fileStatus.textContent = 'File loaded: ' + file.name;
  };
  reader.readAsText(file, 'UTF-8');
});

// Button to run the transform
sanitizeBtn.addEventListener('click', () => {
  if (!originalText) {
    alert('Please upload a .tex file first.');
    return;
  }

  // First, the equation reference transformation.
  const eqOption = document.querySelector('input[name="replaceOption"]:checked').value;
  let text = originalText;
  if (eqOption === 'eqToParen') {
    text = window.Latex.transformEqToParenRef(text);
  } else if (eqOption === 'parenToEq') {
    text = window.Latex.transformParenRefToEq(text);
  }

  // Now the display mode equation transformation.
  const displayOptionElem = document.querySelector('input[name="displayOption"]:checked');
  if (displayOptionElem) {
    const displayOption = displayOptionElem.value;
    if (displayOption === 'toDollar') {
      text = window.Latex.transformDisplay(text, '$$', '$$');
    } else if (displayOption === 'toBracket') {
      text = window.Latex.transformDisplay(text, '\\[', '\\]');
    } else if (displayOption === 'toEquation') {
      text = window.Latex.transformDisplay(text, '\\begin{equation*}', '\\end{equation*}');
    }
    // For "none", do nothing.
  }
  
  // Apply indentation if requested
  const indentOption = document.querySelector('input[name="indentOption"]:checked').value;
  if (indentOption === 'autoIndent') {
    text = window.Latex.autoIndent(text);
  }

  transformedText = text;
  transformMsg.classList.remove('hidden');
  transformMsg.textContent = 'Transformation complete!';
  downloadBtn.classList.remove('hidden');
});

// ---------------------------
// 3. DOWNLOAD
// ---------------------------
downloadBtn.addEventListener('click', () => {
  const blob = new Blob([transformedText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sanitized.tex';
  a.click();
  URL.revokeObjectURL(url);
});
