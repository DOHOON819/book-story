const http = require("node:http"),
  fs = require("node:fs"),
  path = require("node:path");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");
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
              ".svg": "image/svg+xml",
            }[path.extname(file)] || "application/octet-stream",
        })
        .end(data);
  });
});
(async () => {
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.BROWSER_PATH ||
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
  });
  await page.route("**/config.js", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body:
        fs.readFileSync(path.join(root, "config.js"), "utf8") +
        "\nSITE_CONFIG.relays=[];",
    }),
  );
  await page.goto("http://127.0.0.1:" + server.address().port);
  await page.locator(".hero").waitFor();
  await page.evaluate(async () => {
    await document.fonts.ready;
    const hero = document.querySelector(".hero").outerHTML,
      brand = SITE_CONFIG.brand;
    document.body.innerHTML =
      '<div class="social-art"><div class="social-brand"><img src="./favicon.svg">' +
      brand +
      "<small>" +
      SITE_CONFIG.texts.ko.subtitle +
      "</small></div>" +
      hero +
      '<div class="social-url">dohoon819.github.io/' +
      SITE_CONFIG.slug +
      "</div></div>";
  });
  await page.addStyleTag({
    content:
      '.social-art{padding:36px 46px;width:1200px;height:630px;background:#f5f2e9}.social-brand{display:flex;align-items:center;gap:13px;font-family:"DM Serif Display",serif;font-size:30px;margin-bottom:26px}.social-brand img{width:40px;height:40px}.social-brand small{font-family:var(--font);margin-left:auto;font-size:13px;color:#8b9679}.hero{height:425px;grid-template-columns:1.2fr 1fr}.hero-copy{padding:40px 42px}.hero h1{font-size:44px}.hero-intro{font-size:14px}.hero-art{min-height:380px}.display-book{height:268px;width:190px}.display-book.front{right:137px;top:71px}.display-book.back{right:23px;top:96px}.display-book.front strong{font-size:42px}.art-orbit{width:300px;height:300px;top:70px;right:35px}.speech-note{width:185px;height:255px}.speech-note b{font-size:42px}.note-front{top:80px;right:140px}.note-back{right:25px;top:101px}.social-url{font-size:12px;letter-spacing:.05em;color:#8a9675;margin-top:25px}.hero-actions,.hero-foot{display:none}body[data-site=story] .hero h1{font-size:56px}',
  });
  await page.screenshot({ path: path.join(root, "social-preview.png") });
  console.log("Generated social-preview.png");
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await browser?.close();
    server.close();
  });
