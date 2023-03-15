import Video from "../models/Video.js";

export const home = async (req, res) => {
  const videos = await Video.find({}).sort({ createdAt: "desc" });
  return res.render("home", { pageTitle: "Home", videos });
};
export const watch = async (req, res) => {
  const { id } = req.params; //동일함 const id = req.params.id
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  return res.render("watch", { pageTitle: `Watching : ${video.title}`, video });
}; //"watch"가 pug파일, 즉 view파일의 이름과 연동이 되는구나!

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  return res.render("edit", { pageTitle: `Editing : ${video.title}`, video });
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  const video = await Video.findById(id);
  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  } //const { title } = req.body; 여기서 title은 watch.pug의 input name=title으로 설정되어 있다.
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};
export const postUpload = async (req, res) => {
  const { title, description, hashtags } = req.body;
  // Video({     //=const video = new Video_새로운 Video라고 선언 대신 하단에 await video.save();를 넣어줘야 함
  try {
    await Video.create({
      title,
      description,
      hashtags: Video.formatHashtags(hashtags), //Video.formatHashtags(hashtags)의 hashtags는 req.body.hashtags임
    });
    return res.redirect("/");
  } catch (error) {
    return res.render("upload", { pageTitle: "Upload Video", errorMessage: error._message });
  }
  // await video.save(); //DB에 데이터를 저장하는 코드. 데이터를 저장하고 나서 다음 함수가 나와야 하므로 ajax를 사용한다.
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"), //RegExp = Regular Expression of contains keyword
      },
    });
  }
  return res.render("search", { pageTitle: "Search", videos });
};
