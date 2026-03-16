import { Types } from "mongoose";
import BookModel, { BookInput, BookDocument } from "../models/book";
import UserModel, { UserDocument } from '../models/user'

/**
   * 
   * Description: Service to handle operations related to books.
   * Provides methods to create, read, update, and delete books,
   * as well as to search for books by author, mark books as sold, and search only for available books.
   * 
   * Methods:
   * - getBooks: Retrieves all books.
   * - addBook: Adds a new book.
   * - findBookById: Finds a book by its ID.
   * - findBooks: Finds all available books (not sold).
   * - findBookByAuthor: Finds books by author (case-insensitive).
   * - removeBook: Deletes a book by its ID.
   * - markBookAsSold: Marks a book as sold and assigns a buyer.
   * - getAvailableBooks: Retrieves all available books (not sold).
   * - getSoldBooks: Retrieves all sold books.
   * - updateBook: Updates a book by its ID.
   * - buyBook: Allows a user to buy a book if it is available (there should be a method to check availability).
   * 
   * Error handling: Each method handles errors and throws exceptions with descriptive messages.
*/

class BookService {

   async getBooks(): Promise<BookDocument[]> {
      try {
         return await BookModel.find();
      } catch (error) {
         if (error instanceof Error) {
            throw new Error(`Error fetching books: ${error.message}`);
         }
         throw new Error(`Error fetching books`);
      }
   }

   async addBook(bookInput: BookInput): Promise<BookDocument> {
      try {
         return await BookModel.create({ ...bookInput });

      } catch (error) {
         if (error instanceof Error) {
            throw new Error(`Error adding book: ${error.message}`);
         }
         throw new Error(`Error adding book`);
      }
   }

   async findBookById(bookId: string): Promise<BookDocument | null> {
      try {
         const book = await BookModel.findById(bookId);
         if (!book) {
            throw new Error(`Book with ID ${bookId} not found`);
         }
         return book;
      } catch (error) {
         throw new Error(`Error finding book`);
      }
   }

   async getAvailableBooks(): Promise<BookDocument[]> {
      try {
         return await BookModel.find({ sold: false });
      } catch (error) {
         if (error instanceof Error) {
            throw new Error(`Error fetching books: ${error.message}`);
         }
         throw new Error(`Error fetching books`);
      }
   }

   async findBooks(): Promise<BookDocument[]> {
      return await this.getAvailableBooks()
   }

   async findBookByAuthor(authorName: string): Promise<BookDocument[]> {
      try {
         return await BookModel.find({ author: new RegExp(authorName, 'i') });
      } catch (error) {
         if (error instanceof Error) {
            throw new Error(`Error fetching books: ${error.message}`);
         }
         throw new Error(`Error fetching books`);
      }
   }

   async removeBook(bookId: string): Promise<boolean> {
      try {
         const book = await BookModel.findOneAndDelete({ _id: bookId });
         return book !== null;
      } catch (error) {
         if (error instanceof Error) {
            throw new Error(`Error deleting book: ${error.message}`);
         }
         throw new Error("Error deleting book");
      }
   }

   async markBookAsSold(bookId: string, buyerId: string): Promise<BookDocument | null> {
      try {
         const book = await this.findBookById(bookId);
         if (!book) return null;

         if (book.isSold) return null;

         const updatedBook = await BookModel.findOneAndUpdate(
            { _id: bookId },
            { isSold: true, buyerId },
            { returnDocument: 'after' }
         );

         return updatedBook;
      } catch (error) {
         this.handleError("Error marking book as sold", error);
      }
   }

   private checkBookAvailability(book: BookDocument): boolean {
      if (book.isSold) throw new Error("Book is already sold");
      return true;
   }

   private handleError(message: string, error: unknown): never {
      if (error instanceof Error) throw new Error(`${message}: ${error.message}`);
      throw new Error(message);
   }

   async buyBook(userId: string, bookId: string): Promise<string | null> {
      try {
         const book = await this.findBookById(bookId);
         if (!book) return null;

         if (book.isSold) return null;

         await this.markBookAsSold(bookId, userId);

         return `El libro ${book.title} ha sido comprado por el usuario con ID ${userId}.`;
      } catch (error) {
         this.handleError("Error buying book", error);
      }
   }

   async updateBook(bookId: string, updates: Partial<BookInput>): Promise<BookDocument | null> {
      try {
         const updatedBook = await BookModel.findOneAndUpdate(
            { _id: bookId },
            updates,
            { returnDocument: 'after' }
         );
         return updatedBook;
      } catch (error) {
         this.handleError("Error updating book", error);
      }
   }

   async getSoldBooks(): Promise<BookDocument[]> {
      try {
         return await BookModel.find({ sold: true });
      } catch (error) {
         if (error instanceof Error) {
            throw new Error(`Error fetching books: ${error.message}`);
         }
         throw new Error(`Error fetching books`);
      }
   }
}

export default new BookService();