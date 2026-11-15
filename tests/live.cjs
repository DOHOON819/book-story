const http = require("node:http"),
  fs = require("node:fs"),
  path = require("node:path"),
  assert = require("node:assert/strict");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");
if (process.env.COMMUNITY_LIVE !== "1")
  throw new Error("Set COMMUNITY_LIVE=1 to run isolated public relay checks.");
let browser;
const server = http.createServer((req, res) => {
  const file = path.resolve(
    root,
    "." +
      (new URL(req.url, "http://local").pathname === "/"
        ? "/index.html"
        : new URL(req.url, "http://local").pathname),
  );
  if (!file.startsWith(root + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) res.writeHead(404).end();
    else
      res
        .writeHead(200, {
          "Content-Type":
            {
              ".html": "text/html",
              ".js": "text/javascript",
              ".css": "text/css",
              ".png": "image/png",
              ".svg": "image/svg+xml",
            }[path.extname(file)] || "application/octet-stream",
        })
        .end(data);
  });
});
(async () => {
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const origin = "http://127.0.0.1:" + server.address().port,
    stamp = Date.now();
  browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.BROWSER_PATH ||
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  async function visitor() {
    const context = await browser.newContext();
    await context.route("**/config.js", (route) =>
      route.fulfill({
        contentType: "text/javascript",
        body:
          fs.readFileSync(path.join(root, "config.js"), "utf8") +
          '\nSITE_CONFIG.tag+="-verification-' +
          stamp +
          '";SITE_CONFIG.storage+=":verify-' +
          stamp +
          '";',
      }),
    );
    const page = await context.newPage();
    await page.goto(origin);
    await page.waitForFunction(
      () =>
        document.querySelector("#grid")?.getAttribute("aria-busy") === "false",
      { timeout: 40000 },
    );
    await page.evaluate(
      async () =>
        (window.testBackend = (await import("./community.js")).createCommunity(
          SITE_CONFIG,
        )),
    );
    return page;
  }
  const a = await visitor(),
    b = await visitor();
  let id, comment;
  try {
    id = await a.evaluate(async () => {
      await testBackend.setName("Verification author");
      const post = await testBackend.post({
        title: "Temporary isolated sharing verification",
        name: "Verification author",
        author: "Verification",
        category: SITE_CONFIG.categories[0].id,
        body: "Temporary test of shared community posts. This separate namespace is not displayed on the public site.",
        rating: 5,
      });
      return post.id;
    });
    const found = await b.evaluate(
      async (id) => (await testBackend.getPost(id))?.title,
      id,
    );
    assert.match(found, /Temporary/);
    comment = await b.evaluate(async (id) => {
      await testBackend.setName("Verification reader");
      await testBackend.react(id, { heart: true, vote: 1 });
      return await testBackend.comment(
        id,
        "Temporary cross-browser public comment verification.",
        "Verification reader",
      );
    }, id);
    let social;
    for (let attempt = 0; attempt < 5; attempt++) {
      social = await a.evaluate((id) => testBackend.social(id), id);
      if (
        social.hearts === 1 &&
        social.likes === 1 &&
        social.comments.length === 1
      )
        break;
      console.log(
        "Waiting for relay read visibility",
        JSON.stringify({
          hearts: social.hearts,
          likes: social.likes,
          comments: social.comments.length,
        }),
      );
      await a.waitForTimeout(1500);
    }
    assert.equal(social.hearts, 1);
    assert.equal(social.likes, 1);
    assert.equal(social.comments.length, 1);
    await b.evaluate(
      async (id) => testBackend.react(id, { heart: true, vote: -1 }),
      id,
    );
    let changed;
    for (let attempt = 0; attempt < 5; attempt++) {
      changed = await a.evaluate((id) => testBackend.social(id), id);
      if (changed.likes === 0 && changed.dislikes === 1) break;
      await a.waitForTimeout(1500);
    }
    assert.equal(changed.likes, 0);
    assert.equal(changed.dislikes, 1);
    console.log(
      "PASS live public relays: independent browser reads, exact-ID share, public heart, exclusive votes and comments.",
    );
  } finally {
    if (comment)
      await b.evaluate(
        async ({ id, comment }) => testBackend.removeComment(id, comment),
        { id, comment },
      );
    if (id)
      await a.evaluate(async (id) => {
        const p = await testBackend.getPost(id);
        if (p) await testBackend.removePost(p);
      }, id);
    if (id) {
      assert.equal(await b.evaluate((id) => testBackend.getPost(id), id), null);
      console.log(
        "PASS cleanup: temporary post and comment removed. No content created in the normal site feed.",
      );
    }
  }
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await browser?.close();
    server.close();
  });
