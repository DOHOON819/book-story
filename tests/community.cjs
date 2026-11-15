const http = require("node:http"),
  fs = require("node:fs"),
  path = require("node:path"),
  assert = require("node:assert/strict");
const { WebSocketServer } = require("ws");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, ".."),
  out = path.join(root, "test-results");
fs.mkdirSync(out, { recursive: true });
const events = new Map();
let rejectWrites = false,
  omitFeedId = "",
  browser;
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(
      new URL(req.url, "http://local").pathname,
    ),
    file = path.resolve(
      root,
      "." + (pathname === "/" ? "/index.html" : pathname),
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
              ".svg": "image/svg+xml",
              ".png": "image/png",
            }[path.extname(file)] || "application/octet-stream",
        })
        .end(data);
  });
});
function matches(e, f) {
  if (f.ids && !f.ids.includes(e.id)) return false;
  if (f.authors && !f.authors.includes(e.pubkey)) return false;
  if (f.kinds && !f.kinds.includes(e.kind)) return false;
  return Object.keys(f)
    .filter((k) => k.startsWith("#"))
    .every((k) =>
      e.tags.some((t) => t[0] === k.slice(1) && f[k].includes(t[1])),
    );
}
const relay = new WebSocketServer({ server });
relay.on("connection", (socket) =>
  socket.on("message", (bytes) => {
    const [type, id, ...filters] = JSON.parse(bytes);
    if (type === "EVENT") {
      const e = id;
      if (!rejectWrites) events.set(e.id, e);
      socket.send(JSON.stringify(["OK", e.id, !rejectWrites, "test relay"]));
    }
    if (type === "REQ") {
      for (const e of events.values())
        if (
          filters.some((f) => matches(e, f) && !(e.id === omitFeedId && !f.ids))
        )
          socket.send(JSON.stringify(["EVENT", id, e]));
      socket.send(JSON.stringify(["EOSE", id]));
    }
  }),
);
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=",
  "base64",
);
(async () => {
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const origin = "http://127.0.0.1:" + server.address().port;
  browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.BROWSER_PATH ||
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  const errors = [];
  async function visitor(width = 1440, height = 1000) {
    const context = await browser.newContext({ viewport: { width, height } });
    await context.addInitScript(() =>
      Object.defineProperty(navigator, "share", {
        value: undefined,
        configurable: true,
      }),
    );
    await context.route("**/config.js", async (route) => {
      const body = fs.readFileSync(path.join(root, "config.js"), "utf8");
      await route.fulfill({
        contentType: "text/javascript",
        body:
          body +
          '\nwindow.SITE_CONFIG.relays=["ws://127.0.0.1:' +
          server.address().port +
          '"];window.SITE_CONFIG.mediaUrls=["https://test-media.invalid/upload"];',
      });
    });
    await context.route("https://test-media.invalid/**", (route) =>
      route.request().method() === "POST"
        ? route.fulfill({
            contentType: "application/json",
            body: JSON.stringify({
              nip94_event: {
                tags: [["url", "https://test-media.invalid/cover.png"]],
              },
            }),
          })
        : route.fulfill({ contentType: "image/png", body: png }),
    );
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("dialog", (d) => d.accept());
    await page.goto(origin);
    await page.locator('#grid[aria-busy="false"]').waitFor();
    await page.evaluate(async () => {
      window.testBackend = (await import("./community.js")).createCommunity(
        window.SITE_CONFIG,
      );
    });
    return { page, context };
  }
  const { page: a } = await visitor();
  const type = await a.evaluate(() => SITE_CONFIG.type);
  assert.equal(await a.locator(".post-card").count(), 0);
  await a.screenshot({
    path: path.join(out, "empty-desktop.png"),
    fullPage: true,
  });
  await a.locator('[data-action="compose"]').first().click();
  await a.locator("#profileDialog[open]").waitFor();
  await a.locator("#nameInput").fill("첫번째 독자");
  await a.locator("#profileForm [type=submit]").click();
  await a.locator("#composeDialog[open]").waitFor();
  await a
    .locator("#postTitle")
    .fill(
      type === "book"
        ? "테스트: 오래 기억할 한 권"
        : "테스트: 어느 날의 작은 친절",
    );
  if (type === "book") {
    await a.locator("#postAuthor").fill("작가 이름");
    await a.locator("#postRating").selectOption("5");
  }
  await a.locator("#postCategory").selectOption({ index: 1 });
  await a
    .locator("#postBody")
    .fill(
      "이 글은 자동 기능 점검용이며 공개 사이트에는 게시되지 않습니다. 마음에 남았던 순간과 오래 기억할 이야기를 나눕니다.\n\n사람들의 다양한 관점이 모이면 더 풍성한 공간이 됩니다.",
    );
  await a.locator("#consent").check();
  await a.locator("#publishButton").click();
  await a.locator("#composeDialog").waitFor({ state: "hidden" });
  await a.locator(".post-card").waitFor();
  const id = await a.locator("[data-card]").first().getAttribute("data-card");
  const { page: b } = await visitor(390, 844);
  assert.equal(
    await b.locator(".post-card").count(),
    1,
    "public feed visible to another browser",
  );
  await b.locator('[data-action="detail"][data-id="' + id + '"]').click();
  await b.locator("#detailDialog [data-kind=heart]:not([disabled])").waitFor();
  assert.equal(
    await b.locator("[data-action=deletePost]").count(),
    0,
    "other visitor cannot delete",
  );
  await b.locator("#detailDialog [data-kind=heart]").click();
  await b.waitForFunction(
    () =>
      document
        .querySelector("#detailDialog [data-kind=heart]")
        .getAttribute("aria-pressed") === "true",
  );
  await b.locator("#detailDialog [data-kind=like]").click();
  await b.waitForFunction(
    () =>
      document
        .querySelector("#detailDialog [data-kind=like]")
        .getAttribute("aria-pressed") === "true",
  );
  await b.locator("#detailDialog [data-kind=dislike]").click();
  await b.waitForFunction(
    () =>
      document
        .querySelector("#detailDialog [data-kind=dislike]")
        .getAttribute("aria-pressed") === "true",
  );
  assert.equal(
    await b.locator("#detailDialog [data-count=likes]").innerText(),
    "0",
  );
  await b
    .locator("#commentBody")
    .fill("<img src=x onerror=alert(1)> 좋은 이야기네요!");
  await b.locator("#commentForm [type=submit]").click();
  await b.locator("#profileDialog[open]").waitFor();
  await b.locator("#nameInput").fill("첫번째 독자");
  await b.locator("#profileForm [type=submit]").click();
  await b.waitForFunction(() =>
    document.getElementById("nameMessage").textContent.includes("사용 중"),
  );
  await b.locator("#nameInput").fill("다른 독자");
  await b.locator("#profileForm [type=submit]").click();
  await b.locator("#profileDialog").waitFor({ state: "hidden" });
  await b.locator("#commentForm [type=submit]").click();
  await b.locator(".comment").waitFor();
  assert.equal(await b.locator(".comment img").count(), 0, "XSS is escaped");
  await a.locator('[data-action="detail"][data-id="' + id + '"]').click();
  await a.locator(".comment").waitFor();
  assert.equal(
    await a.locator("#detailDialog [data-count=hearts]").innerText(),
    "1",
  );
  assert.equal(
    await a.locator("#detailDialog [data-count=dislikes]").innerText(),
    "1",
  );
  assert.equal(await a.locator("[data-action=deleteComment]").count(), 0);
  await b.locator("[data-action=deleteComment]").click();
  await b.locator(".comment").waitFor({ state: "hidden" });
  await a.locator("[data-action=refreshSocial]").click();
  await a.locator(".comment").waitFor({ state: "hidden" });
  rejectWrites = true;
  await b
    .locator("#commentBody")
    .fill("실패해도 남아 있어야 하는 댓글 초안입니다.");
  await b.locator("#commentForm [type=submit]").click();
  await b.waitForFunction(() =>
    document.getElementById("commentMessage").textContent.includes("완료하지"),
  );
  assert.match(await b.locator("#commentBody").inputValue(), /실패해도/);
  rejectWrites = false;
  await a.locator("[data-dialog=detailDialog]").click();
  await b.locator("[data-dialog=detailDialog]").click();
  // More cards, in an isolated local relay only.
  await a.evaluate(async () => {
    for (let i = 0; i < 3; i++)
      await testBackend.post({
        name: "첫번째 독자",
        title:
          SITE_CONFIG.type === "book"
            ? [
                "다시 펼쳐 보고 싶은 이야기",
                "일상에서 발견한 작은 시선",
                "아주 오래 남을 장면들",
              ][i]
            : [
                "비 오는 날, 버스에서 있었던 일",
                "친구들이 아직도 꺼내는 이야기",
                "낯선 도시에서 만난 친절",
              ][i],
        author: "테스트 작가",
        body: "자동 테스트용으로 작성된 글입니다. 실제 커뮤니티에는 게시하지 않습니다. 작은 순간을 함께 나누며 서로의 다른 관점을 알아가는 공간을 확인합니다.\n\n기억에 남는 이야기는 아주 사소한 곳에서 시작되곤 합니다.",
        category: SITE_CONFIG.categories[i + 1].id,
        rating: 4,
        spoiler: i === 2,
      });
  });
  await a.locator("[data-action=refresh]").first().click();
  await a.waitForFunction(
    () => document.querySelectorAll(".post-card").length === 4,
  );
  await a.evaluate(() => {
    document.activeElement?.blur();
    scrollTo({ top: 0, behavior: "instant" });
  });
  await a.screenshot({
    path: path.join(out, "feed-desktop.png"),
    fullPage: true,
  });
  await a.locator("#searchInput").fill("아주없는검색어");
  assert.equal(await a.locator(".post-card").count(), 0);
  await a.locator("[data-action=clear]").click();
  assert.equal(await a.locator(".post-card").count(), 4);
  await a.locator("[data-action=save]").first().click();
  await a.locator("[data-scope=saved]").first().click();
  assert.equal(await a.locator(".post-card").count(), 1);
  await a.locator("[data-scope=discover]").first().click();
  await a.locator("[data-action=reader]").first().click();
  await a.locator("#readerDialog[open]").waitFor();
  await a.locator("#readerScroller").focus();
  await a.keyboard.press("ArrowDown");
  await a.waitForTimeout(700);
  assert.ok(
    (await a.locator("#readerScroller").evaluate((el) => el.scrollTop)) > 100,
  );
  for (const size of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
    { width: 360, height: 740 },
    { width: 844, height: 390 },
  ]) {
    await a.setViewportSize(size);
    await a.waitForTimeout(250);
    assert.equal(
      await a
        .locator("#readerScroller")
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
      true,
      "reader overflow " + size.width,
    );
    await a.screenshot({
      path: path.join(out, "reader-" + size.width + ".png"),
    });
  }
  await a.locator("[data-dialog=readerDialog]").click();
  for (const lang of ["ko", "en"]) {
    await a.setViewportSize({ width: 390, height: 844 });
    await a.locator("#language").selectOption(lang);
    assert.equal(
      await a.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      lang + " mobile overflow",
    );
    await a.evaluate(() => {
      document.activeElement?.blur();
      scrollTo({ top: 0, behavior: "instant" });
    });
    await a.screenshot({
      path: path.join(out, "mobile-" + lang + ".png"),
      fullPage: true,
    });
  }
  await a.locator("#language").selectOption("ko");
  // Exact-ID shares do not depend on the feed window.
  omitFeedId = id;
  await b.goto(origin + "/?post=" + id);
  await b.locator("#detailDialog[open]").waitFor();
  await b.locator(".story-body").waitFor();
  assert.match(await b.locator("#detailContent h1").innerText(), /테스트/);
  omitFeedId = "";
  await b.locator("#detailDialog [data-action=share]").click();
  await b.locator("#shareDialog[open]").waitFor();
  assert.ok(
    (await b.locator("#shareUrl").inputValue()).endsWith("?post=" + id),
  );
  await b.locator("[data-dialog=shareDialog]").click();
  await b.locator("[data-dialog=detailDialog]").click();
  await a.locator("[data-action=compose]:visible").first().click();
  await a.locator("#postTitle").fill("사진 첨부 테스트");
  if (type === "book") await a.locator("#postAuthor").fill("작가");
  await a.locator("#postCategory").selectOption({ index: 1 });
  await a
    .locator("#postBody")
    .fill(
      "사진 업로드를 검증하는 자동 테스트입니다. 공개 웹사이트에는 게시되지 않습니다.",
    );
  await a
    .locator("#imageFile")
    .setInputFiles({ name: "photo.png", mimeType: "image/png", buffer: png });
  await a.locator("#imagePreview img").waitFor();
  await a.locator("#consent").check();
  rejectWrites = true;
  await a.locator("#publishButton").click();
  await a.waitForFunction(() =>
    document.getElementById("postMessage").textContent.includes("완료하지"),
  );
  assert.equal(await a.locator("#postTitle").inputValue(), "사진 첨부 테스트");
  rejectWrites = false;
  await a.locator("#publishButton").click();
  await a.locator("#composeDialog").waitFor({ state: "hidden" });
  await a.locator(".post-image img").first().waitFor();
  await a.locator('[data-action=detail][data-id="' + id + '"]').click();
  await a.locator("[data-action=deletePost]").click();
  await a.locator("#detailDialog").waitFor({ state: "hidden" });
  await b.goto(origin + "/?post=" + id);
  await b.locator("#detailDialog[open]").waitFor();
  await b.waitForFunction(() =>
    document.getElementById("detailContent").textContent.includes("삭제"),
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS " +
      type +
      ": two visitors, signed shared publishing, names, hearts, exclusive votes, comments, author-only deletion, XSS escaping, outage drafts, bookmarks, search, exact-ID links, image upload, mobile/landscape reader, KO/EN.",
  );
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await browser?.close();
    for (const s of relay.clients) s.terminate();
    relay.close();
    server.close();
  });
