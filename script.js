let books = [];
let patrons = [];
let checkedOutBooks = new Map(); // Maps book title to an array of patron IDs

function loadBooksFromFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = e.target.result.split('\n');
        let book = null;
        let readingBook = false;

        data.forEach(line => {
            line = line.trim();
            if (line === "") return;

            if (!readingBook) {
                book = { title: line };
                readingBook = true;
            } else if (!book.isbn) {
                book.isbn = line;
            } else if (!book.publisher) {
                book.publisher = line;
            } else if (!book.year) {
                book.year = line;
            } else if (!book.price) {
                book.price = parseFloat(line);
            } else if (!book.copies) {
                book.copies = parseInt(line);
            } else if (!book.author) {
                book.author = line;
                books.push(book);
                readingBook = false;
            }
        });
        alert('Books loaded successfully!');
    };
    reader.readAsText(file);
}

function printLibraryBooks() {
    const availableBooks = books.filter(book => {
        const checkedOutCount = getCheckedOutCopies(book.title).length;
        return checkedOutCount < book.copies; // Only show books where not all copies are checked out
    });
    displayBooks(availableBooks);
}

function searchBook() {
    const title = prompt('Enter book title to search:');
    const book = books.find(b => b.title.toLowerCase() === title.toLowerCase());
    if (book && getCheckedOutCopies(book.title).length < book.copies) {
        displayBooks([book]);
    } else {
        alert('Sorry, But that book is not found or is currently checked out in all available copies.');
    }
}

function updateBookCopies() {
    const title = prompt('Enter book title to update copies:');
    const book = books.find(b => b.title.toLowerCase() === title.toLowerCase());
    if (book) {
        const newCopies = parseInt(prompt('Enter new number of copies:'));
        if (newCopies >= 0) {
            book.copies = newCopies;
            alert('Book updated successfully!');
        } else {
            alert('Invalid number of copies.');
        }
    } else {
        alert('Book not found.');
    }
}

function printAllBooks() {
    displayBooks(books);
}

function printAllPatrons() {
    const content = document.getElementById('content');
    content.innerHTML = '<h2>Patrons</h2><ul>' + patrons.map(p => `<li>${p.name} (ID: ${p.libraryID}) - Books Checked Out: ${getCheckedOutBooksByPatron(p.libraryID).join(', ')}</li>`).join('') + '</ul>';
}

function enterPatronInfo() {
    const name = prompt('Enter patron name:');
    const id = prompt('Enter patron ID:');
    if (patrons.some(p => p.libraryID === id)) {
        alert('Patron already exists.');
    } else {
        patrons.push({ name, libraryID: id });
        alert('Patron added successfully!');
    }
}

function checkOutBook() {
    const name = prompt('Enter patron name for checkout:');
    const patron = patrons.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (!patron) {
        alert('Patron not found.');
        return;
    }
    const title = prompt('Enter book title to check out:');
    const book = books.find(b => b.title.toLowerCase() === title.toLowerCase());
    if (book) {
        const checkedOutCount = getCheckedOutCopies(book.title).length;
        if (checkedOutCount < book.copies) {
            // Add patron ID to the checked-out list for this book
            if (!checkedOutBooks.has(book.title)) {
                checkedOutBooks.set(book.title, []);
            }
            checkedOutBooks.get(book.title).push(patron.libraryID);
            alert('Book checked out successfully!');
        } else {
            alert('No available copies for checkout.');
        }
    } else {
        alert('Book not available for checkout.');
    }
}

function checkInBook() {
    const name = prompt('Enter patron name for check-in:');
    const patron = patrons.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (!patron) {
        alert('Patron not found.');
        return;
    }
    const title = prompt('Enter book title to check in:');
    const checkedOutPatrons = getCheckedOutCopies(title);
    const patronIndex = checkedOutPatrons.indexOf(patron.libraryID);

    if (patronIndex !== -1) {
        // Remove this patron's ID from the checked-out list for this book
        checkedOutPatrons.splice(patronIndex, 1);
        alert('Book checked in successfully!');
    } else {
        alert('This book is not checked out by this patron.');
    }
}

function exitProgram() {
    alert("Refreshing the program...");
    
    // Apply the fade-out effect
    document.getElementById('reload').classList.add('fade-out');
    
    // Wait for the fade-out animation to complete before reloading
    setTimeout(function() {
        location.reload(); // Refresh the page after 1 second
    }, 1000); // Timeout duration matches the fade-out duration
}


function displayBooks(bookList) {
    const content = document.getElementById('content');
    content.innerHTML = '<h2>Books in Library</h2><ul>' + bookList.map(book => `<li>${book.title} by ${book.author} (${book.copies} copies, ${getCheckedOutCopies(book.title).length} checked out)</li>`).join('') + '</ul>';
}

function getCheckedOutCopies(title) {
    return checkedOutBooks.get(title) || []; // Return an empty array if no copies are checked out
}

function getCheckedOutBooksByPatron(libraryID) {
    const checkedOutBooksByPatron = [];
    books.forEach(book => {
        const checkedOutCount = getCheckedOutCopies(book.title);
        checkedOutCount.forEach(patronID => {
            if (patronID === libraryID) {
                checkedOutBooksByPatron.push(book.title);
            }
        });
    });
    return checkedOutBooksByPatron;
}

