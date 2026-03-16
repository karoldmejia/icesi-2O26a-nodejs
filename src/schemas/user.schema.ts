/**
 * Here you need use zod por validate your user schema
 * 
 * For example:
 *  when name is required and must be a string
 *  validate email is required and must be a valid email
 *  validate password is required and must be at least 8 characters long
 */

import { z } from "zod";

export const userSchema = z.object({
  name: z.string().optional(),

  email: z.string()
    .email({ message: "Invalid email address" }),

  password: z.string()
    .min(5, { message: "Password must be at least 8 characters long" })
});

export const createUserSchema = userSchema;

export const updateUserSchema = userSchema.partial();