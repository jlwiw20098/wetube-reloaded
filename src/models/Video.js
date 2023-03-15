import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxLength: 80 },
  description: { type: String, required: true, trim: true, minLength: 20 },
  createdAt: { type: Date, required: true, default: Date.now() },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
});

videoSchema.static("formatHashtags", function (hashtags) {
  return hashtags
    .split(",")
    .map((word) => word.replace(/\s/g, ""))
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});
//middleware : save되기 전 중간에 끼어드는 함수
// videoSchema.pre("save", async function () {
//   this.hashtags = this.hashtags[0]
//     .split(",")
//     .map((word) => word.replace(/\s/g, ""))
//     .map((word) => (word.startsWith("#") ? word : `#${word}`));
// });

const Video = mongoose.model("Video.js", videoSchema);
export default Video;
