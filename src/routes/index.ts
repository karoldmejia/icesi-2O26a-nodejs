import { Express } from "express";
import userController  from "../controllers/user.controller";
import bookController  from "../controllers/book.controller";
import auth from '../middlewares/auth';

const routes = (app: Express) => {

    // User Routes
    
    app.get("/users", auth, userController.getUsers);
    app.get("/users/:id", auth, userController.getOneUser);
    app.delete("/users/:id", auth, userController.deleteUser);
    app.put("/users/:id", auth, userController.updateUser);

    //login route and create user do not require auth
    app.post("/users", userController.createUser);
    app.post("/login", userController.login);

    // Book Routes
    app.post("/books", auth, bookController.createBook);
    app.get("/books", auth, bookController.getBooks);
    app.get("/books/:id", auth, bookController.getOneBook);
    app.delete("/books/:id", auth, bookController.deleteBook);
    app.put("/books/:id", auth, bookController.updateBook);
    app.get("/books/author/:id", auth, bookController.getBooksByAuthor);
    app.post("/books/:bookId/buy/:userId", auth, bookController.buyBook);
    
};

export default routes;