import "dotenv/config";
import "./db"; //파일 자체를 import함
import "./models/Video";
import "./models/User";
import app from "./server";

const Port = 4000;

const handleListening = () => console.log(`Server listening on port http://localhost:${Port}`);

app.listen(Port, handleListening);
