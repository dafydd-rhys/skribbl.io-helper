let wordList = new Map();
let currentPage = 1;
const itemsPerPage = 8 * 4; // 8 rows and 4 columns
let currentSuggestions = [];

// Load the CSV file and organize the data
async function loadCSV() {
  const response = await fetch('/Skribbl-words.csv');
  const text = await response.text();
  text.split('\n').forEach(line => {
    const [word, count] = line.split(',');
    const wordLength = word.length;

    if (!wordList.has(wordLength)) {
      wordList.set(wordLength, []);
    }

    wordList.get(wordLength).push({ word, count: parseInt(count, 10) });
  });
}

// Find words matching the pattern and count
function findWords(pattern) {
  const wordLength = pattern.length;
  const regex = new RegExp(`^${pattern.replace(/_/g, '.')}$`);
  const words = wordList.get(wordLength) || [];

  // Filter words by pattern and sort by count
  return words
    .filter(item => regex.test(item.word))
    .sort((a, b) => b.count - a.count)
    .map(item => `${item.word} (${item.count})`);
}

// Render the current page
function renderPage() {
  const wordListElement = document.getElementById('wordList');
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  wordListElement.innerHTML = ''; // Clear the current list
  const pageItems = currentSuggestions.slice(startIndex, endIndex);

  if (pageItems.length === 0) {
    wordListElement.innerHTML = '<li>No matches found</li>';
  } else {
    pageItems.forEach(word => {
      const listItem = document.createElement('li');
      listItem.textContent = word;
      wordListElement.appendChild(listItem);
    });
  }

  // Update pagination buttons
  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = endIndex >= currentSuggestions.length;
}

// Event listener for the search button
document.getElementById('findWordsButton').addEventListener('click', () => {
  const letters = document.getElementById('lettersInput').value;
  currentSuggestions = findWords(letters); // Fetch suggestions
  currentPage = 1; // Reset to the first page
  renderPage(); // Render the first page
});

// Event listeners for pagination buttons
document.getElementById('prevPage').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderPage();
  }
});

document.getElementById('nextPage').addEventListener('click', () => {
  const maxPage = Math.ceil(currentSuggestions.length / itemsPerPage);
  if (currentPage < maxPage) {
    currentPage++;
    renderPage();
  }
});

// Populate the dropdown with values from 3 to 19
const lengthDropdown = document.getElementById('lengthDropdown');
for (let i = 3; i <= 19; i++) {
  const option = document.createElement('option');
  option.value = i;
  option.textContent = i;
  lengthDropdown.appendChild(option);
}

// Update the text box when the dropdown value changes
lengthDropdown.addEventListener('change', () => {
  const length = parseInt(lengthDropdown.value, 10);
  document.getElementById('lettersInput').value = '_'.repeat(length);
});

// Load the CSV file on page load
window.onload = loadCSV;
