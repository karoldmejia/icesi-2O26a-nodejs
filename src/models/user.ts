import mongoose, { Types } from 'mongoose';
export interface UserInput {
  name?: string | undefined;
  email: string;
  password: string;
}

export interface UserDocument extends UserInput, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

const userSchema = new mongoose.Schema({
    name : {type: String, required: true},
    email: {type: String, required: true, index: true, unique : true},
    password: {type: String, required: true}
}, {timestamps:true, collection: 'users'});

const User = mongoose.model<UserDocument>('User', userSchema);

export default User;    