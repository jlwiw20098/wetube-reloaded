import mongoose, { connect } from "mongoose"; //npm 패키지로 mongoose 설치한 다음 import함

mongoose.get("strictQuery", true);
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}); //cmd에서 mongo치고 지급받은 url을 붙여넣음

const db = mongoose.connection;

const handleOpen = () => console.log("Connected to Data Base :)");
const handleError = (error) => console.log("Data Base has Error :(");
db.on("error", handleError);
db.once("open", handleOpen); //once는 한 번만 이벤트 발생
