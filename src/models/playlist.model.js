import mongoose from "mongoose"

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: ture,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Playlist = mongoose.model('Playlist',playlistSchema)