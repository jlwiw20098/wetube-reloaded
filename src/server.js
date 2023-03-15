import express from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import { localMiddleware } from "./middlewares";
console.log(process.env.COOKIE_SECRET);

const app = express();
const logger = morgan("dev");

//pug를 쓰기 위해 설정하고 경로를 설정하는 코드
app.set("view engine", "pug"); //express에서 pug라는 npm pakage를 쓰겠다 선언.
app.set("views", process.cwd() + "/src/views"); //경로 재설정
app.use(logger);
app.use(express.urlencoded({ extended: true })); //input창의 값을 가져오기 위해서 필요한 코드, express에서 pug의 form형식을 이해시키기 위함

//쿠키를 생성하는 session method : 사이트로 들어오는 모두를 기억한다(쿠키를 준다)
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 2000000,
    },
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);

app.use(localMiddleware);
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

export default app;
