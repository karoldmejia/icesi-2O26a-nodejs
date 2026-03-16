import { Request, Response } from "express";
import userService from "../services/user.service";
import { UserDocument, UserInput } from "../models/user";
import { createUserSchema, updateUserSchema } from "../schemas/user.schema";
import bcrypt from "bcrypt";

export class UserController {

    public async createUser(req: Request, res: Response) {
        try {
            const parsed = createUserSchema.parse(req.body);

            let userExists: UserDocument | null = null;
            try {
                userExists = await userService.findUsersByEmail(parsed.email);
            } catch (serviceError) {
                return res.status(500).json({ message: "Error checking user existence" });
            }

            if (userExists) {
                return res.status(400).json({ message: "User already exists" });
            }

            const user: UserDocument = await userService.addUser(parsed);
            res.status(201).json(user);

        } catch (error: any) {
            res.status(500).json({ message: "Error creating user" });
        }
    }

    public async getUsers(req: Request, res: Response): Promise<void> {
        try {
            const users = await userService.getUsers();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: "Error fetching users" });
        }
    }

    public async getOneUser(req: Request, res: Response): Promise<void> {
        try {
            const user: UserDocument | null = await userService.findUserById(req.params.id ?? "");
            if (user) {
                res.status(200).json(user);
            } else {
                res.status(404).json({ message: "User not found" });
            }
        } catch (error) {
            res.status(500).json({ message: "Error fetching user" });
        }
    }

    public async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id ?? "";
            const success = await userService.removeUser(id);
            if (success) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: "User not found" });
            }
        } catch (error) {
            res.status(500).json({ message: "Error deleting user" });
        }
    }

    public async updateUser(req: Request, res: Response) {
        try {

            const id = req.params.id;

            if (!id) {
                return res.status(400).json({ message: "Missing id" });
            }
            const user = await userService.findUserById(id);

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const updates = updateUserSchema.parse(req.body) as Partial<UserInput>;
            if (updates.password) {
                updates.password = await bcrypt.hash(updates.password, 10);
            }

            const updatedUser = await userService.updateUser(id, updates);
            res.status(200).json(updatedUser);

        } catch (error) {
            res.status(500).json({ message: "Error updating user" });
        }
    }

    public async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            const user = await userService.findUsersByEmail(email);

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const isValid = await bcrypt.compare(password, user.password);

            if (!isValid) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            const { token } = await userService.login(email, password);

            res.status(200).json({ token });

        } catch (error) {
            res.status(500).json({ message: "Error logging in" });
        }
    }

}

export default new UserController();