import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;
  const pageTitle = "join";
  if (password !== password2) {
    return res.status(400).render("join", { pageTitle, errorMessage: "Password confirmation does not match" });
  }
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("join", { pageTitle, errorMessage: "This username / email is already taken." });
  }
  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("join", { pageTitle, errorMessage });
  }
};
export const getLogin = (req, res) => res.render("login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    return res
      .status(400)
      .render("login", { pageTitle, errorMessage: "An account with this username does not exists." });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", { pageTitle, errorMessage: "Wrong password" });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  res.redirect("/");
};

export const startGithubCreated = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    //어떤 user 데이터인지 구별한 다음
    scope: "read:user user:email",
    //해당 user 데이터의 어떤 데이터들을 사용할 것인지 정의
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  //URL을 만듦. 왜? Post request를 보내기 위해
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  console.log("여기야!", tokenRequest);
  //만약 지급받은 token안에 access_token이 있다면
  //access_token은 로그인에 성공하면 저절로 지급됨.
  //access_token은 Github API와 상호작용시 필요
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    //user profile을 받기 위해 요청하는 함수 userData
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    //user profile에 email이 null값으로 표현이 되므로 따로 email값을 받아오는 함수
    //userData와 구조는 동일하다
    //데이터는 email array형식으로 준다.
    console.log(userData);
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    //만약 email을 찾지 못한다면(=email안에 primary와 verified값이 false라면)
    const emailObj = emailData.find((email) => email.primary === true && email.verified === true);
    if (!emailObj) {
      return res.redirect("/login");
    }
    //만약 email이 있다면 Mongodb에서 해당 email을 찾는 함수 User는 models/User.js
    let user = await User.findOne({ email: emailObj.email });
    //만약 Mongodb에 같은 email이 없다면 저절로 계정이 생성(Github Profile에 근거하여)
    //그래서 Github로 로그인했는데 wetube에 계정이 없어서 저절로 만들어진 경우는 wetube의 비밀번호가 없다.
    if (!user) {
      const user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true, //Github로 계정을 만들었단 의미=비밀번호가 없다는 의미/비밀번호가 있다?,false값이다? wetube계정과 Github계정이 연동된거임.
        location: userData.location,
      });
    }
    //만약 Github email과 같은 email이 wetube email에 있다면 아래 코드 실행
    req.session.loggedIn = true;
    req.session.user = user;
    console.log("마지막", req.session);
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
  //로그인에 성공하면 쿠키가 생성되고, DB에는 session에 우리 데이터가 저장됨.
  //그래서 다른 url로 접근할 때 마다 같은 홈페이지면 쿠키와 session의 대조를 통해 로그인 상태 유지 가능.
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};
export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};

export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { name, email, username, location },
  } = req; // = const i = req.session.user.id / const a = req.body.name/email~
  const userExists = await User.exists({ $or: [{ name }, { email }, { username }] });
  if (!userExists) {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        name,
        email,
        username,
        location, //req.body에서 가져올 값들은 반드시 input의 name으로 정의되어야 한다.
      },
      { new: true }
    );
    req.session.user = updatedUser;
    return res.redirect("/users/edit");
  } else {
    return res.render("edit-profile", { errorMessage: "User or Email or username are exist" });
  }
};
export const see = (req, res) => res.send("See");
