import UserModel, { UserInput, UserDocument } from "../models/user"
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


/**
 *
 * Description: Service to handle operations related to users.
 * Provides methods to create, read, update, and delete users,
 * as well as to find users by ID or email, and to handle user login.
 *
 * Methods:
 * - getUsers: Retrieves all users.
 * - addUser: Adds a new user.
 * - findUserById: Finds a user by their ID.
 * - findUsersByEmail: Finds a user by their email address.
 * - removeUser: Removes a user by their ID.
 * - updateUser: Updates a user's information by their ID.
 * - login: Generates a JWT token for user login using their email.
 *
 * Error handling: Each method handles errors and throws exceptions with descriptive messages.
 */

class UserService {
    private SALT_ROUNDS = 10;

    async getUsers(): Promise<UserDocument[]> {
        try {
            return await UserModel.find();
        } catch (error) {
            this.handleError("Error fetching users", error);
        }
    }

    async addUser(userInput: UserInput): Promise<UserDocument> {
        try {
            const hashedPassword = await bcrypt.hash(userInput.password, this.SALT_ROUNDS);
            return await UserModel.create({ ...userInput, password: hashedPassword });
        } catch (error) {
            this.handleError("Error adding user", error);
        }
    }

    async findUserById(userId: string): Promise<UserDocument> {
        try {
            const user = await UserModel.findById(userId);
            if (!user) throw new Error(`User with ID ${userId} not found`);
            return user;
        } catch (error) {
            this.handleError("Error finding user", error);
        }
    }

    async findUsersByEmail(email: string): Promise<UserDocument | null> {
        try {
            return await UserModel.findOne({ email: email });
        } catch (error) {
            this.handleError("Error fetching users by email", error);
        }
    }

    async removeUser(userId: string): Promise<UserDocument> {
        try {
            const deleted = await UserModel.findOneAndDelete({ _id: userId });
            if (!deleted) throw new Error(`User with ID ${userId} not found`);
            return deleted;
        } catch (error) {
            this.handleError("Error deleting user", error);
        }
    }

async updateUser(userId: string, updates: Partial<UserInput>): Promise<UserDocument> {
    try {
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, this.SALT_ROUNDS);
        }

        const updatedUser = await UserModel.findOneAndUpdate(
            { _id: userId },
            updates,
            { returnOriginal: false }
        );

        if (!updatedUser) throw new Error(`User with ID ${userId} not found`);
        return updatedUser;
    } catch (error) {
        this.handleError("Error updating user", error);
    }
}

    async login(email: string, password: string): Promise<{ token: string }>{
        try {
            const user = await UserModel.findOne({ email });
            if (!user) throw new Error("Invalid email or password");

            const valid = await bcrypt.compare(password, user.password);
            if (!valid) throw new Error("Invalid email or password");

            const token = jwt.sign(
                { user_id: user._id, email: user.email },
                process.env.JWT_SECRET || "secret",
                { expiresIn: "1d" }
            );
            return {token};
        } catch (error) {
            this.handleError("Error during login", error);
        }
    }

    private handleError(message: string, error: unknown): never {
        if (error instanceof Error) throw new Error(`${message}: ${error.message}`);
        throw new Error(message);
    }
}

export default new UserService();
