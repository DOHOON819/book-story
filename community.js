import {
  finalizeEvent,
  generateSecretKey,
  getPublicKey,
  verifyEvent,
} from "./vendor/nostr.js";

// Public, signed community events. No server credential is shipped to the browser.
const POST = 30023,
  META = 30078,
  COMMENT = 1,
  DELETE = 5;
const now = () => Math.floor(Date.now() / 1000);
const tag = (event, key) => event.tags.find((t) => t[0] === key)?.[1];
const hex = (bytes) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
const bytes = (value) =>
  new Uint8Array(value.match(/../g).map((v) => parseInt(v, 16)));
const validId = (value) => /^[0-9a-f]{64}$/.test(value || "");
const newer = (a, b) =>
  !b ||
  a.created_at > b.created_at ||
  (a.created_at === b.created_at && a.id < b.id);
export function safeUrl(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}
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
class Relay {
  constructor(url) {
    this.url = url;
    this.pending = new Map();
    this.connecting = null;
    this.socket = null;
  }
  async connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return this.socket;
    if (this.connecting) return this.connecting;
    this.connecting = new Promise((resolve, reject) => {
      const ws = (this.socket = new WebSocket(this.url));
      const timer = setTimeout(() => {
        ws.close();
        reject(new Error("offline"));
      }, 7000);
      ws.addEventListener("open", () => {
        clearTimeout(timer);
        resolve(ws);
      });
      ws.addEventListener("message", (message) => {
        try {
          const data = JSON.parse(message.data),
            entry = this.pending.get(data[1]);
          if (!entry) return;
          if (
            data[0] === "EVENT" &&
            entry.events &&
            data[2].content?.length <= 50000 &&
            verifyEvent(data[2]) &&
            entry.filters.some((f) => matches(data[2], f))
          ) {
            if (entry.events.size < 4000) entry.events.set(data[2].id, data[2]);
          }
          if (data[0] === "EOSE" && entry.events)
            entry.finish(null, [...entry.events.values()]);
          if (data[0] === "OK" && !entry.events)
            entry.finish(data[2] ? null : new Error("rejected"), data[2]);
          if (data[0] === "CLOSED") entry.finish(new Error("offline"));
        } catch {
          /* Invalid or unsigned messages never become user content. */
        }
      });
      const closed = () => {
        clearTimeout(timer);
        this.connecting = null;
        for (const entry of [...this.pending.values()])
          entry.finish(new Error("offline"));
        reject(new Error("offline"));
      };
      ws.addEventListener("error", closed);
      ws.addEventListener("close", closed);
    }).finally(() => {
      this.connecting = null;
    });
    return this.connecting;
  }
  async request(type, value) {
    const ws = await this.connect(),
      id = type === "REQ" ? crypto.randomUUID() : value.id;
    return new Promise((resolve, reject) => {
      let done = false;
      const finish = (error, result) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        this.pending.delete(id);
        if (type === "REQ" && ws.readyState === 1)
          ws.send(JSON.stringify(["CLOSE", id]));
        error ? reject(error) : resolve(result);
      };
      const timer = setTimeout(() => finish(new Error("offline")), 7000);
      this.pending.set(id, {
        finish,
        ...(type === "REQ" ? { events: new Map(), filters: value } : {}),
      });
      ws.send(
        JSON.stringify(
          type === "REQ" ? ["REQ", id, ...value] : ["EVENT", value],
        ),
      );
    });
  }
}
export function createCommunity(config) {
  const keyName = config.storage + ":key";
  let secret = localStorage.getItem(keyName);
  if (!secret) {
    secret = hex(generateSecretKey());
    localStorage.setItem(keyName, secret);
  }
  if (!validId(secret)) throw new Error("identity");
  const key = bytes(secret),
    userId = getPublicKey(key);
  const relays = config.relays.map((url) => new Relay(url));
  const app = config.tag,
    profileD = app + ":profile",
    times = new Map();
  const profileFilter = {
    kinds: [META],
    "#t": [app],
    "#d": [profileD],
    limit: 1000,
  };
  const sign = (kind, tags, content, created_at = now()) =>
    finalizeEvent(
      {
        kind,
        tags: [...tags, ["t", app]],
        content: JSON.stringify(content),
        created_at,
      },
      key,
    );
  async function query(filters) {
    const results = await Promise.allSettled(
      relays.map((r) => r.request("REQ", filters)),
    );
    if (!results.some((r) => r.status === "fulfilled"))
      throw new Error("offline");
    const unique = new Map();
    for (const r of results)
      if (r.status === "fulfilled")
        for (const e of r.value) unique.set(e.id, e);
    return [...unique.values()];
  }
  async function publish(event) {
    const results = await Promise.allSettled(
      relays.map((r) => r.request("EVENT", event)),
    );
    if (!results.some((r) => r.status === "fulfilled"))
      throw new Error("offline");
    return event;
  }
  function tick(d) {
    const value = Math.max(now(), (times.get(d) || 0) + 1);
    times.set(d, value);
    return value;
  }
  function profiles(events) {
    const latest = new Map(),
      result = new Map();
    for (const e of events)
      if (
        e.kind === META &&
        tag(e, "d") === profileD &&
        tag(e, "t") === app &&
        newer(e, latest.get(e.pubkey))
      )
        latest.set(e.pubkey, e);
    for (const e of latest.values()) {
      try {
        const n = JSON.parse(e.content).name;
        if (typeof n === "string" && n.trim().length >= 2 && n.length <= 30)
          result.set(e.pubkey, n);
      } catch {
        /* Invalid profile. */
      }
      if (e.pubkey === userId)
        times.set(profileD, Math.max(times.get(profileD) || 0, e.created_at));
    }
    return result;
  }
  function validate(value) {
    if (
      !value ||
      typeof value.title !== "string" ||
      value.title.trim().length < 2 ||
      value.title.length > 100
    )
      throw new Error("invalid");
    if (
      typeof value.body !== "string" ||
      value.body.trim().length < 20 ||
      value.body.length > config.maxBody
    )
      throw new Error("invalid");
    if (
      !config.categories.some((c) => c.id === value.category) ||
      typeof value.name !== "string" ||
      value.name.trim().length < 2 ||
      value.name.length > 30
    )
      throw new Error("invalid");
    if (
      config.type === "book" &&
      (typeof value.author !== "string" ||
        !value.author.trim() ||
        value.author.length > 80)
    )
      throw new Error("invalid");
    if (
      value.image &&
      (!safeUrl(value.image.url) || !/^https:/.test(value.image.url))
    )
      throw new Error("invalid");
    return {
      title: value.title.trim(),
      body: value.body.trim(),
      name: value.name.trim(),
      category: value.category,
      author: String(value.author || "").slice(0, 80),
      rating: [1, 2, 3, 4, 5].includes(Number(value.rating))
        ? Number(value.rating)
        : 0,
      spoiler: Boolean(value.spoiler),
      image: value.image || null,
    };
  }
  function toPost(event, names = new Map()) {
    try {
      if (event.kind !== POST || tag(event, "t") !== app) return null;
      const value = validate(JSON.parse(event.content));
      return {
        ...value,
        id: event.id,
        userId: event.pubkey,
        name: names.get(event.pubkey) || value.name,
        created: event.created_at,
        coordinate: POST + ":" + event.pubkey + ":" + tag(event, "d"),
      };
    } catch {
      return null;
    }
  }
  function deleted(event, deletes) {
    const coordinate = POST + ":" + event.pubkey + ":" + tag(event, "d");
    return deletes.some(
      (d) =>
        d.pubkey === event.pubkey &&
        d.tags.some(
          (t) =>
            (t[0] === "e" && t[1] === event.id) ||
            (t[0] === "a" &&
              t[1] === coordinate &&
              d.created_at >= event.created_at),
        ),
    );
  }
  return {
    userId,
    async getName() {
      return profiles(await query([profileFilter])).get(userId) || "";
    },
    async setName(input) {
      const name = String(input).trim().normalize("NFKC");
      if (name.length < 2 || name.length > 30) throw new Error("name");
      const known = profiles(await query([profileFilter]));
      if (
        [...known].some(
          ([id, n]) => id !== userId && n.toLowerCase() === name.toLowerCase(),
        )
      )
        throw new Error("taken");
      await publish(sign(META, [["d", profileD]], { name }, tick(profileD)));
      return name;
    },
    async feed() {
      const events = await query([
        profileFilter,
        { kinds: [POST], "#t": [app], limit: 250 },
        { kinds: [DELETE], "#t": [app], "#k": [String(POST)], limit: 1500 },
      ]);
      const names = profiles(events),
        deletes = events.filter((e) => e.kind === DELETE);
      return events
        .filter((e) => e.kind === POST && !deleted(e, deletes))
        .map((e) => toPost(e, names))
        .filter(Boolean)
        .sort((a, b) => b.created - a.created || a.id.localeCompare(b.id));
    },
    async getPost(id) {
      if (!validId(id)) return null;
      const event = (
        await query([{ ids: [id], kinds: [POST], "#t": [app] }])
      )[0];
      if (!event) return null;
      const coordinate = POST + ":" + event.pubkey + ":" + tag(event, "d");
      const related = await query([
        { ...profileFilter, authors: [event.pubkey] },
        {
          kinds: [DELETE],
          authors: [event.pubkey],
          "#e": [id],
          "#k": [String(POST)],
        },
        {
          kinds: [DELETE],
          authors: [event.pubkey],
          "#a": [coordinate],
          "#k": [String(POST)],
        },
      ]);
      return deleted(
        event,
        related.filter((e) => e.kind === DELETE),
      )
        ? null
        : toPost(event, profiles(related));
    },
    async post(value) {
      const clean = validate(value),
        d = app + ":post:" + crypto.randomUUID();
      const event = await publish(
        sign(
          POST,
          [
            ["d", d],
            ["title", clean.title],
          ],
          clean,
        ),
      );
      return toPost(event);
    },
    async removePost(post) {
      if (post.userId !== userId) throw new Error("owner");
      await publish(
        sign(
          DELETE,
          [
            ["e", post.id],
            ["a", post.coordinate],
            ["k", String(POST)],
          ],
          { reason: "Author removed post" },
        ),
      );
    },
    async social(id) {
      if (!validId(id)) throw new Error("invalid");
      const events = await query([
        { kinds: [META, COMMENT], "#e": [id], "#t": [app], limit: 2000 },
        { kinds: [DELETE], "#r": [id], "#t": [app], "#k": ["1"], limit: 1000 },
      ]);
      const reactions = new Map(),
        comments = [],
        removes = new Set();
      for (const e of events)
        if (e.kind === DELETE)
          for (const t of e.tags)
            if (t[0] === "e") removes.add(e.pubkey + ":" + t[1]);
      for (const e of events) {
        if (tag(e, "t") !== app) continue;
        try {
          const v = JSON.parse(e.content);
          if (
            e.kind === META &&
            tag(e, "d") === app + ":reaction:" + id &&
            typeof v.heart === "boolean" &&
            [-1, 0, 1].includes(v.vote) &&
            newer(e, reactions.get(e.pubkey))
          )
            reactions.set(e.pubkey, { ...e, value: v });
          if (
            e.kind === COMMENT &&
            v.type === "comment" &&
            typeof v.body === "string" &&
            v.body.trim() &&
            v.body.length <= 1000 &&
            typeof v.name === "string" &&
            !removes.has(e.pubkey + ":" + e.id)
          )
            comments.push({
              id: e.id,
              userId: e.pubkey,
              body: v.body,
              name: v.name.slice(0, 30),
              created: e.created_at,
            });
        } catch {
          /* Untrusted content is parsed and validated before display. */
        }
      }
      const mine = reactions.get(userId),
        values = [...reactions.values()].map((e) => e.value);
      if (mine) times.set(id, Math.max(times.get(id) || 0, mine.created_at));
      return {
        hearts: values.filter((v) => v.heart).length,
        likes: values.filter((v) => v.vote === 1).length,
        dislikes: values.filter((v) => v.vote === -1).length,
        mine: mine?.value || { heart: false, vote: 0 },
        comments: comments.sort(
          (a, b) => a.created - b.created || a.id.localeCompare(b.id),
        ),
      };
    },
    async react(id, value) {
      if (
        !validId(id) ||
        typeof value.heart !== "boolean" ||
        ![-1, 0, 1].includes(value.vote)
      )
        throw new Error("invalid");
      await publish(
        sign(
          META,
          [
            ["d", app + ":reaction:" + id],
            ["e", id],
          ],
          { heart: value.heart, vote: value.vote },
          tick(id),
        ),
      );
    },
    async comment(id, body, name) {
      if (
        !validId(id) ||
        !body.trim() ||
        body.length > 1000 ||
        name.length < 2 ||
        name.length > 30
      )
        throw new Error("invalid");
      const event = await publish(
        sign(COMMENT, [["e", id]], {
          type: "comment",
          body: body.trim(),
          name,
        }),
      );
      return {
        id: event.id,
        userId,
        body: body.trim(),
        name,
        created: event.created_at,
      };
    },
    async removeComment(id, comment) {
      if (comment.userId !== userId) throw new Error("owner");
      await publish(
        sign(
          DELETE,
          [
            ["e", comment.id],
            ["r", id],
            ["k", "1"],
          ],
          { reason: "Author removed comment" },
        ),
      );
    },
    async upload(file) {
      if (
        !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
          file.type,
        ) ||
        file.size > 8 * 1024 * 1024
      )
        throw new Error("image");
      for (const endpoint of config.mediaUrls) {
        try {
          const auth = finalizeEvent(
            {
              kind: 27235,
              created_at: now(),
              tags: [
                ["u", endpoint],
                ["method", "POST"],
              ],
              content: "",
            },
            key,
          );
          const form = new FormData();
          form.append("file", file);
          form.append("content_type", file.type);
          form.append("size", String(file.size));
          const response = await fetch(endpoint, {
            method: "POST",
            headers: { Authorization: "Nostr " + btoa(JSON.stringify(auth)) },
            body: form,
            signal: AbortSignal.timeout(60000),
          });
          if (!response.ok) continue;
          const data = await response.json(),
            url = data?.nip94_event?.tags?.find((t) => t[0] === "url")?.[1];
          if (safeUrl(url) && url.startsWith("https://")) return { url };
        } catch {
          /* Try next public media host. */
        }
      }
      throw new Error("upload");
    },
    backup() {
      return { app, version: 1, secret };
    },
    restore(data) {
      if (!data || data.app !== app || !validId(data.secret))
        throw new Error("backup");
      getPublicKey(bytes(data.secret)); // Validate scalar before replacing anything.
      localStorage.setItem(keyName, data.secret);
    },
  };
}
