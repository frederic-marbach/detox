// We'll keep a global variable to store the clean LaTeX.
let transformedText = '';

// References to HTML elements
const fileInput      = document.getElementById('fileInput');
const sourceTextarea = document.getElementById('sourceTextarea');
const sanitizeBtn    = document.getElementById('sanitizeBtn');
const transformMsg   = document.getElementById('transformMsg');
const downloadBtn    = document.getElementById('downloadBtn');
const copyBtn        = document.getElementById('copyBtn');
const copyMsg        = document.getElementById('copyMsg');

// ---------------------------
// 1. FILE READING AND SOURCE MANAGEMENT
// ---------------------------

fileInput.addEventListener('change', function() {
  const file = fileInput.files[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = function (e) {
    sourceTextarea.value = e.target.result;
  };
  reader.readAsText(file, 'UTF-8');
});

// Button to run the transform
sanitizeBtn.addEventListener('click', () => {
  // Get the current source text (either from file or textarea)
  const currentSource = sourceTextarea.value.trim();
  
  if (!currentSource) {
    alert('Please provide LaTeX source by uploading a file or pasting text in the text area.');
    return;
  }

  // First, the equation reference transformation.
  const eqOption = document.querySelector('input[name="replaceOption"]:checked').value;
  let text = currentSource;
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
  transformMsg.classList.remove('d-none');
  transformMsg.textContent = 'Transformation complete!';
  downloadBtn.classList.remove('hidden');
  copyBtn.classList.remove('hidden');
});

// ---------------------------
// 3. DOWNLOAD AND CLIPBOARD
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

copyBtn.addEventListener('click', async () => {
  await navigator.clipboard.writeText(transformedText);
  copyMsg.classList.remove('d-none');
  copyMsg.textContent = 'Copied to clipboard!';
  // Hide the success message after 2 seconds
  setTimeout(() => { copyMsg.classList.add('d-none'); }, 2000);
});
