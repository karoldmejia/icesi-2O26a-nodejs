import { Request, Response } from "express";
import bookController from "../../src/controllers/book.controller";
import bookService from "../../src/services/book.service";

jest.mock("../../src/services/book.service");

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe("BookController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createBook", () => {
    it("should create a new book", async () => {
      const req = {
        body: { title: "Test Book", author: "Test Author" }
      } as Request;

      (bookService.addBook as jest.Mock).mockResolvedValue({ id: "1", title: "Test Book", author: "Test Author" });

      const res = mockResponse();

      await bookController.createBook(req, res);

      expect(bookService.addBook).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: "1", title: "Test Book", author: "Test Author" });
    });

    it("should return 500 if an error occurs", async () => {
      const req = { body: {} } as Request;

      (bookService.addBook as jest.Mock).mockRejectedValue(new Error("Error"));

      const res = mockResponse();

      await bookController.createBook(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Error creating book" });
    });
  });

  describe("getBooks", () => {
    it("should return a list of books", async () => {
      const req = {} as Request;
      const res = mockResponse();

      (bookService.getBooks as jest.Mock).mockResolvedValue([{ id: "1", title: "Test Book", author: "Test Author" }]);

      await bookController.getBooks(req, res);

      expect(bookService.getBooks).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ id: "1", title: "Test Book", author: "Test Author" }]);
    });

    it("should return 500 if an error occurs", async () => {
      const req = {} as Request;
      const res = mockResponse();

      (bookService.getBooks as jest.Mock).mockRejectedValue(new Error("Error"));

      await bookController.getBooks(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Error fetching books" });
    });
  });

  describe("getOneBook", () => {
    it("should return a book by id", async () => {
      const req = { params: { id: "1" } } as unknown as Request;
      const res = mockResponse();

      (bookService.findBookById as jest.Mock).mockResolvedValue({ id: "1", title: "Test Book", author: "Test Author" });

      await bookController.getOneBook(req, res);

      expect(bookService.findBookById).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: "1", title: "Test Book", author: "Test Author" });
    });

    it("should return 404 if the book is not found", async () => {
      const req = { params: { id: "1" } } as unknown as Request;
      const res = mockResponse();

      (bookService.findBookById as jest.Mock).mockResolvedValue(null);

      await bookController.getOneBook(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Book not found" });
    });
  });

  describe("deleteBook", () => {
    it("should delete a book", async () => {
      const req = { params: { id: "1" } } as unknown as Request;
      const res = mockResponse();

      (bookService.removeBook as jest.Mock).mockResolvedValue(true);

      await bookController.deleteBook(req, res);

      expect(bookService.removeBook).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("should return 404 if the book is not found", async () => {
      const req = { params: { id: "1" } } as unknown as Request;
      const res = mockResponse();

      (bookService.removeBook as jest.Mock).mockResolvedValue(false);

      await bookController.deleteBook(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Book not found" });
    });
  });

  describe("updateBook", () => {
    it("should update a book", async () => {
      const req = {
        params: { id: "1" },
        body: { title: "Updated Book", author: "Updated Author" }
      } as unknown as Request;
      const res = mockResponse();

      (bookService.findBookById as jest.Mock).mockResolvedValue({ id: "1" });
      (bookService.updateBook as jest.Mock).mockResolvedValue({ id: "1", title: "Updated Book", author: "Updated Author" });

      await bookController.updateBook(req, res);

      expect(bookService.findBookById).toHaveBeenCalledWith("1");
      expect(bookService.updateBook).toHaveBeenCalledWith("1", req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: "1", title: "Updated Book", author: "Updated Author" });
    });

    it("should return 404 if the book is not found", async () => {
      const req = { params: { id: "1" }, body: {} } as unknown as Request;
      const res = mockResponse();

      (bookService.findBookById as jest.Mock).mockResolvedValue(null);

      await bookController.updateBook(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Book not found" });
    });
  });

  describe("getBooksByAuthor", () => {
    it("should return books by a specific author", async () => {
      const req = { params: { id: "Test Author" } } as unknown as Request;
      const res = mockResponse();
  
      (bookService.findBookByAuthor as jest.Mock).mockResolvedValue([
        { id: "1", title: "Book 1", author: "Test Author" },
        { id: "2", title: "Book 2", author: "Test Author" },
      ]);
  
      await bookController.getBooksByAuthor(req, res);
  
      expect(bookService.findBookByAuthor).toHaveBeenCalledWith("Test Author");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        { id: "1", title: "Book 1", author: "Test Author" },
        { id: "2", title: "Book 2", author: "Test Author" },
      ]);
    });
  
    it("should return 500 if an error occurs", async () => {
      const req = { params: { id: "Test Author" } } as unknown as Request;
      const res = mockResponse();
  
      (bookService.findBookByAuthor as jest.Mock).mockRejectedValue(new Error("Error"));
  
      await bookController.getBooksByAuthor(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Error fetching books by author" });
    });
  });
});
