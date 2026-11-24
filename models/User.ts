import { model, models, Schema } from "mongoose";
import { unique } from "next/dist/build/utils";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true },
);

const User = models.User || model("User", userSchema);

export default User;
