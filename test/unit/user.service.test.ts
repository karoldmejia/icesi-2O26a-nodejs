import userService from "../../src/services/user.service";
import UserModel, { UserDocument, UserInput } from "../../src/models/user";

jest.mock("../../src/models/user", () => {
  class MockUser {
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

  return { __esModule: true, default: MockUser };
});

describe("UserService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("debe obtener todos los usuarios", async () => {
    const mockUsers = [{ _id: "1", email: "test@test.com" }] as UserDocument[];
    (UserModel.find as jest.Mock).mockResolvedValue(mockUsers);

    const result = await userService.getUsers();
    expect(UserModel.find).toHaveBeenCalled();
    expect(result).toEqual(mockUsers);
  });

  it("debe crear un usuario", async () => {
    const mockUser = { _id: "1", email: "new@test.com", password: "hashed" } as UserDocument;
    (UserModel.create as jest.Mock).mockResolvedValue(mockUser);

    const result = await userService.addUser({ email: "new@test.com", password: "1234", name: "Mateo" });
    expect(UserModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "new@test.com",
        name: "Mateo",
        password: expect.any(String)
      })
    ); expect(result).toEqual(mockUser);
  });

  it("debe encontrar usuario por id", async () => {
    const mockUser = { _id: "1", email: "id@test.com" } as UserDocument;
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await userService.findUserById("1");
    expect(UserModel.findById).toHaveBeenCalledWith("1");
    expect(result).toEqual(mockUser);
  });

  it("debe encontrar usuario por email", async () => {
    const mockUser = { _id: "1", email: "find@test.com" } as UserDocument;
    (UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);

    const result = await userService.findUsersByEmail("find@test.com");
    expect(UserModel.findOne).toHaveBeenCalledWith({ email: "find@test.com" });
    expect(result).toEqual(mockUser);
  });

  it("debe eliminar usuario", async () => {
    const mockUser = { _id: "1", email: "delete@test.com" } as UserDocument;
    (UserModel.findOneAndDelete as jest.Mock).mockResolvedValue(mockUser);

    const result = await userService.removeUser("1");
    expect(UserModel.findOneAndDelete).toHaveBeenCalledWith({ _id: "1" });
    expect(result).toEqual(mockUser);
  });

  it("debe actualizar usuario", async () => {
    const mockUser = { _id: "1", email: "update@test.com" } as UserDocument;
    (UserModel.findOneAndUpdate as jest.Mock).mockResolvedValue(mockUser);

    const result = await userService.updateUser("1", { email: "update@test.com", name: "Mateo", password: "123" });
    expect(UserModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "1" },
      { email: "update@test.com", name: "Mateo", password: expect.any(String) },
      { returnOriginal: false }
    );
    expect(result).toEqual(mockUser);
  });

  it("debe devolver un token al hacer login", async () => {
    const mockUser = { _id: "1", email: "login@test.com", password: "hashed" } as UserDocument;

    (UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);
    jest.spyOn(require("bcrypt"), "compare").mockResolvedValue(true);
    const token = await userService.login("login@test.com", "123456");

    expect(typeof token).toBe("string");
  });
});
