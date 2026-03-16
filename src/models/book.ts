/* This TypeScript code snippet is defining a Mongoose schema and model for a `Book` entity in a
MongoDB database. Here's a breakdown of what each part of the code is doing: */
import { Timestamp } from "mongodb";
import mongoose, { Types, Schema  } from 'mongoose';
import { UserDocument } from './user';
import user from './user';


export interface BookInput {
  title: string | undefined;
  author: string | undefined;
  price?: number | undefined;
  isSold?: boolean | undefined;
  buyerId?: Types.ObjectId | UserDocument | undefined;
}

export interface BookDocument extends BookInput, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

const bookSchema = new mongoose.Schema({
    title : {type: String, required: true},
    author: {type: String, required: true},
    price: {type: Number, required: true},
    isSold: {type: Boolean, required: true, default: false},
    buyerId: {type: mongoose.Schema.Types.ObjectId, required: false, ref: "User"}
}, {timestamps:true, collection: 'books'});

const Book = mongoose.model<BookDocument>('Book', bookSchema);

export default Book;
