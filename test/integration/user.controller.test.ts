import { Request, Response } from "express";
import userController from "../../src/controllers/user.controller";
import userService from "../../src/services/user.service";
import bcrypt from "bcrypt";

jest.mock("../../src/services/user.service");
jest.mock("bcrypt");

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe("UserController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("debe crear un usuario nuevo", async () => {
      const req = {
        body: { email: "test@example.com", password: "123456" },
      } as Request;

      (userService.findUsersByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      (userService.addUser as jest.Mock).mockResolvedValue({
        id: "1",
        email: "test@example.com",
      });

      const res = mockResponse();

      await userController.createUser(req, res);

      expect(userService.findUsersByEmail).toHaveBeenCalledWith("test@example.com");
      expect(userService.addUser).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: "1", email: "test@example.com" });
    });

    it("debe devolver 400 si el usuario ya existe", async () => {
      const req = {
        body: { email: "test@example.com", password: "123456" },
      } as Request;

      (userService.findUsersByEmail as jest.Mock).mockResolvedValue({ id: "1" });

      const res = mockResponse();

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "User already exists" });
    });
  });

  describe("getUsers", () => {
    it("debe devolver lista de usuarios", async () => {
      const req = {} as Request;
      const res = mockResponse();

      (userService.getUsers as jest.Mock).mockResolvedValue([
        { id: "1", email: "test@example.com" },
      ]);

      await userController.getUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ id: "1", email: "test@example.com" }]);
    });
  });

  describe("getOneUser", () => {
    it("debe devolver un usuario por id", async () => {
      const req = { params: { id: "1" } } as unknown as Request;
      const res = mockResponse();

      (userService.findUserById as jest.Mock).mockResolvedValue({
        id: "1",
        email: "test@example.com",
      });

      await userController.getOneUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: "1", email: "test@example.com" });
    });

    it("debe devolver 404 si no encuentra el usuario", async () => {
      const req = { params: { id: "1" } } as unknown as Request;
      const res = mockResponse();

      (userService.findUserById as jest.Mock).mockResolvedValue(null);

      await userController.getOneUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });
  });

  describe("deleteUser", () => {
    it("debe eliminar un usuario", async () => {
      const req = { params: { id: "1" } } as unknown as Request;
      const res = mockResponse();

      (userService.removeUser as jest.Mock).mockResolvedValue(true);

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("debe devolver 404 si no encuentra el usuario", async () => {
      const req = { params: { id: "1" } } as unknown as Request;
      const res = mockResponse();

      (userService.removeUser as jest.Mock).mockResolvedValue(false);

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });
  });

  describe("updateUser", () => {
    it("debe actualizar un usuario", async () => {
      const req = {
        params: { id: "1" },
        body: { email: "new@test.com", password: "newpass" },
      } as unknown as Request;
      const res = mockResponse();

      (userService.findUserById as jest.Mock).mockResolvedValue({ id: "1" });
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      (userService.updateUser as jest.Mock).mockResolvedValue({
        id: "1",
        email: "new@test.com",
      });

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: "1", email: "new@test.com" });
    });

    it("debe devolver 404 si el usuario no existe", async () => {
      const req = { params: { id: "1" }, body: {} } as unknown as Request;
      const res = mockResponse();

      (userService.findUserById as jest.Mock).mockResolvedValue(null);

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });
  });

  describe("login", () => {
    it("debe loguear un usuario con credenciales válidas", async () => {
      const req = {
        body: { email: "test@example.com", password: "123456" },
      } as Request;
      const res = mockResponse();

      (userService.findUsersByEmail as jest.Mock).mockResolvedValue({
        email: "test@example.com",
        password: "hashedPassword",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (userService.login as jest.Mock).mockResolvedValue({ token: "jwt-token" });

      await userController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ token: "jwt-token" });
    });

    it("debe devolver 404 si el usuario no existe", async () => {
      const req = {
        body: { email: "test@example.com", password: "123456" },
      } as Request;
      const res = mockResponse();

      (userService.findUsersByEmail as jest.Mock).mockResolvedValue(null);

      await userController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("debe devolver 401 si la contraseña es incorrecta", async () => {
      const req = {
        body: { email: "test@example.com", password: "wrong" },
      } as Request;
      const res = mockResponse();

      (userService.findUsersByEmail as jest.Mock).mockResolvedValue({
        email: "test@example.com",
        password: "hashedPassword",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await userController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
    });
  });
});
