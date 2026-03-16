import { Types } from "mongoose";
import { z } from "zod";

export const bookSchema = z.object({
  title: z.string()
    .min(1, { message: "Title is required" }),

  author: z.string()
    .min(1, { message: "Author is required" }),

  price: z.number()
    .nonnegative({ message: "Price cannot be negative" })
    .optional(),

  isSold: z.boolean()
    .optional(),
    
  buyerId: z.string()
    .optional()
    .transform((val) => val ? new Types.ObjectId(val) : undefined),
});

export const createBookSchema = bookSchema;

export const updateBookSchema = bookSchema.partial();