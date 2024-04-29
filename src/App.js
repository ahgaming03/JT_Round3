import "./App.css";
import React, { useEffect, useState } from "react";
import * as BooksAPI from "./BooksAPI";

function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function App() {
  const [showSearchPage, setShowSearchPage] = useState(false);
  const [bookShelves] = useState([
    { key: "currentlyReading", name: "Currently Reading" },
    { key: "wantToRead", name: "Want to Read" },
    { key: "read", name: "Have Read" },
  ]);
  const [myBooks, setMyBooks] = useState([]);
  const [searchBooks, setSearchBooks] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const saveBooks = localStorage.getItem("myBooks");
    setMyBooks(saveBooks ? JSON.parse(saveBooks) : []);
  }, [])

  useEffect(() => {
    localStorage.setItem("myBooks", JSON.stringify(myBooks));
  }, [myBooks])

  const isSearch = () => {
    setShowSearchPage(!showSearchPage);
  }

  const resetSearch = () => {
    setSearchBooks([]);
  }

  const searchForBooks = debounce((query) => {
    if (query.length > 0) {
      BooksAPI.search(query).then(books => {
        console.log(books)
        setSearchBooks(books.error ? [] : books)
      })
    } else {
      setSearchBooks([])
    }
  }, 300)

  const handleSearch = (event) => {
    const val = event.target.value;
    setSearchValue(val);
    searchForBooks(val);
  }

  const updatedBooks = searchBooks.map((book) => {
    myBooks.map((b) => {
      if (b.id === book.id) {
        book.shelf = b.shelf;
      }
      return b;
    });
    return book;
  });

  const booksOnThisShelf = (books, shelf) => {
    return shelf.key === "none" ? books : books.filter((book) => book.shelf === shelf.key);
  }

  const moveBook = async (book, shelf) => {
    BooksAPI.update(book, shelf);

    let updatedBooks = [];
    updatedBooks = myBooks.filter((b) => b.id !== book.id);

    if (shelf !== "none") {
      book.shelf = shelf;
      updatedBooks = updatedBooks.concat(book);
    }

    setMyBooks(updatedBooks);
  }



  return (
    <div className="app">
      {showSearchPage ? (
        <div className="search-books">
          <div className="search-books-bar">
            <a className="close-search"
              onClick={() => { isSearch(); resetSearch(); }}
            >
              Close
            </a>
            <div className="search-books-input-wrapper">
              <input
                type="text"
                value={searchValue}
                placeholder="Search by title, author, or ISBN"
                onChange={handleSearch}
                autoFocus
              />
            </div>
          </div>
          <div className="search-books-results">
            <ol className="books-grid">
              {updatedBooks.map((book) => (
                <li key={book.id}>
                  <div className="book">
                    <div className="book-top">
                      <div
                        className="book-cover"
                        style={{
                          width: 128,
                          height: 193,
                          backgroundImage:
                            `url(${book.imageLinks.thumbnail})`,
                        }}
                      ></div>
                      {/* <BookShelfChanger book={book} shelf={book.shelf ? book.shelf : "none"} onMove={onMove} /> */}
                      <div className="book-shelf-changer">
                        {book.shelf ? (
                          <select value={book.shelf} onChange={(e) => moveBook(book, e.target.value)}>
                            <option value="move" disabled>Move to...</option>
                            <option value="currentlyReading">Currently Reading</option>
                            <option value="wantToRead">Want to Read</option>
                            <option value="read">Read</option>
                            <option value="none">None</option>
                          </select>
                        ) : (
                          <select value={"none"} onChange={(e) => moveBook(book, e.target.value)}>
                            <option value="add" disabled>Add to...</option>
                            <option value="currentlyReading">Currently Reading</option>
                            <option value="wantToRead">Want to Read</option>
                            <option value="read">Read</option>
                            <option value="none" hidden>None</option>
                          </select>
                        )}
                      </div>

                    </div>
                    <div className="book-title">{book.title}</div>
                    <div className="book-authors">
                      {book.authors && book.authors.join(", ")}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : (
        <div className="list-books">
          <div className="list-books-title">
            <h1>MyReads</h1>
          </div>
          <div className="list-books-content">
            <div>
              {bookShelves.map((shelf) => (
                <div className="bookshelf" key={shelf.key}>
                  <h2 className="bookshelf-title">{shelf.name}</h2>
                  <div className="bookshelf-books">
                    <ol className="books-grid">
                      {booksOnThisShelf(myBooks, shelf).map((book) => (
                        <li key={book.id}>
                          <div className="book">
                            <div className="book-top">
                              <div
                                className="book-cover"
                                style={{
                                  width: 128,
                                  height: 193,
                                  backgroundImage:
                                    `url(${book.imageLinks.thumbnail})`,
                                }}
                              ></div>
                              <div className="book-shelf-changer">
                                <select value={shelf.key} onChange={(e) => moveBook(book, e.target.value)}>
                                  <option value="move" disabled>Move to...</option>
                                  <option value="currentlyReading">Currently Reading</option>
                                  <option value="wantToRead">Want to Read</option>
                                  <option value="read">Read</option>
                                  <option value="none">None</option>
                                </select>
                              </div>
                            </div>
                            <div className="book-title">{book.title}</div>
                            <div className="book-authors">
                              {book.authors && book.authors.join(", ")}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="open-search">
            <a onClick={isSearch}>Add a book</a>
          </div>
        </div>
      )
      }
    </div >
  );
}

export default App;
