import http from "http";

function httpPost(path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = {
      hostname: "localhost",
      port: 4000,
      path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
        ...headers,
      },
    };
    const req = http.request(opts, (res) => {
      let raw = "";
      res.on("data", (c) => (raw += c));
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  // 1. Login
  const login = await httpPost("/api/auth/login", {
    email: "admin@sharkrypto254.com",
    password: "admin123",
  });
  console.log("Login:", login.status, JSON.stringify(login.body));

  if (!login.body.token) {
    console.error("Login failed — stopping.");
    return;
  }

  // 2. Create post
  const post = await httpPost(
    "/api/posts",
    { title: "Test Article From Script", content: "Body content.", status: "published" },
    { Authorization: `Bearer ${login.body.token}` }
  );
  console.log("Create Post:", post.status, JSON.stringify(post.body));
}

run().catch(console.error);
