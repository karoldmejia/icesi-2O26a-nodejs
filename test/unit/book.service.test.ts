import BookService from "../../src/services/book.service";
import BookModel from "../../src/models/book";

jest.mock("../../src/models/book", () => {
  class MockBook {
    data: any;

    constructor(data: any) {
      this.data = data;
    }

    static find = jest.fn();
    static findOne = jest.fn();
    static findById = jest.fn();
    static findOneAndDelete = jest.fn();
    static findOneAndUpdate = jest.fn();
    static create = jest.fn();
  }

  return { __esModule: true, default: MockBook };
});

describe("BookService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("debería obtener todos los libros", async () => {
    (BookModel.find as jest.Mock).mockResolvedValue([{ title: "Libro 1" }]);

    const books = await BookService.getBooks();
    expect(books).toHaveLength(1);
    expect(books[0].title).toBe("Libro 1");
  });

  it("debería crear un libro", async () => {
    const input = { title: "Nuevo", author: "Autor", price: 100, isSold: false };
    (BookModel.create as jest.Mock).mockResolvedValue(input);

    const newBook = await BookService.addBook(input as any);
    expect(newBook.title).toBe("Nuevo");
  });

  it("debería encontrar un libro por ID", async () => {
    (BookModel.findById as jest.Mock).mockResolvedValue({ id: "1", title: "Libro 1" });

    const book = await BookService.findBookById("1");
    expect(book?.title).toBe("Libro 1");
  });

  it("debería devolver libros disponibles (findBooks llama a getAvailableBooks)", async () => {
    (BookModel.find as jest.Mock).mockResolvedValue([{ title: "Disponible", isSold: false }]);

    const books = await BookService.findBooks();
    expect(books[0].isSold).toBe(false);
  });

  it("debería buscar libros por autor (insensible a mayúsculas)", async () => {
    (BookModel.find as jest.Mock).mockResolvedValue([{ title: "Autor X", author: "Autor" }]);

    const books = await BookService.findBookByAuthor("autor");
    expect(books[0].author).toBe("Autor");
  });

  it("debería eliminar un libro y devolver true", async () => {
    (BookModel.findOneAndDelete as jest.Mock).mockResolvedValue({ id: "1" });

    const result = await BookService.removeBook("1");
    expect(result).toBe(true);
  });

  it("debería devolver false si no encuentra libro para eliminar", async () => {
    (BookModel.findOneAndDelete as jest.Mock).mockResolvedValue(null);

    const result = await BookService.removeBook("2");
    expect(result).toBe(false);
  });

  it("debería marcar un libro como vendido", async () => {
    const updatedBook = { title: "Libro vendido", isSold: true };
    (BookModel.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedBook);

    const result = await BookService.markBookAsSold("id123", "user123");
    expect(result?.isSold).toBe(true);
  });

  it("debería obtener libros disponibles", async () => {
    (BookModel.find as jest.Mock).mockResolvedValue([{ title: "Disponible", isSold: false }]);

    const books = await BookService.getAvailableBooks();
    expect(books[0].isSold).toBe(false);
  });

  it("debería obtener libros vendidos", async () => {
    (BookModel.find as jest.Mock).mockResolvedValue([{ title: "Vendido", isSold: true }]);

    const books = await BookService.getSoldBooks();
    expect(books[0].isSold).toBe(true);
  });

  it("debería actualizar un libro", async () => {
    const updatedBook = { title: "Actualizado", author: "Autor" };
    (BookModel.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedBook);

    const result = await BookService.updateBook("id123", { title: "Actualizado" } as any);
    expect(result?.title).toBe("Actualizado");
  });

  describe("buyBook", () => {
    it("debería comprar un libro si está disponible", async () => {
      const book = { id: "id123", title: "Comprable", isSold: false };
      jest.spyOn(BookService, "findBookById").mockResolvedValue(book as any);
      jest.spyOn(BookService, "markBookAsSold").mockResolvedValue({ ...book, isSold: true } as any);

      const result = await BookService.buyBook("user123", "id123");

      expect(result).toBe("El libro Comprable ha sido comprado por el usuario con ID user123.");
      expect(BookService.markBookAsSold).toHaveBeenCalledWith("id123", "user123");
    });

    it("debería devolver null si el libro no existe", async () => {
      jest.spyOn(BookService, "findBookById").mockResolvedValue(null);

      const result = await BookService.buyBook("user123", "id123");
      expect(result).toBeNull();
    });

    it("debería devolver null si el libro ya está vendido", async () => {
      const book = { id: "id123", title: "Ya vendido", isSold: true };
      jest.spyOn(BookService, "findBookById").mockResolvedValue(book as any);

      const result = await BookService.buyBook("user123", "id123");
      expect(result).toBeNull();
    });
  });
});
