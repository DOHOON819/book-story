import { createCommunity, safeUrl } from "./community.js";
const C = window.SITE_CONFIG;
const $ = (selector) => document.querySelector(selector);
const all = (selector) => [...document.querySelectorAll(selector)];
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(C.storage + ":" + key)) ?? fallback;
  } catch {
    return fallback;
  }
};
const save = (key, value) => {
  try {
    localStorage.setItem(C.storage + ":" + key, JSON.stringify(value));
  } catch {
    toast(T("storageError"));
  }
};
let lang = read("lang", "ko");
if (!["ko", "en"].includes(lang)) lang = "ko";
const words = {
  ko: {
    discover: "발견하기",
    reader: "넘겨 보기",
    savedLabel: "저장한 글",
    name: "이름 정하기",
    searchLabel: "글 검색",
    all: "전체",
    newest: "최신순",
    oldest: "오래된순",
    refresh: "새로고침",
    reading: "읽는 즐거움, 함께.",
    public: "공개 커뮤니티",
    connecting: "연결 중",
    offline: "연결 확인 필요",
    loading: "새로운 이야기를 불러오고 있어요…",
    errorTitle: "지금은 글을 불러올 수 없어요.",
    errorBody:
      "네트워크를 확인한 뒤 다시 시도해주세요. 작성 중인 글은 이 브라우저에 남아 있어요.",
    retry: "다시 불러오기",
    filteredTitle: "아직 일치하는 글이 없어요.",
    filteredBody: "검색어나 주제를 바꾸거나, 직접 첫 글을 남겨보세요.",
    clear: "필터 초기화",
    savedEmpty: "마음에 드는 글을 저장해보세요.",
    savedHint: "책갈피를 누르면 이 브라우저의 목록에 모입니다.",
    mineEmpty: "당신의 첫 글을 기다려요.",
    count: "개의 이야기",
    readMore: "전체 읽기",
    write: "글쓰기",
    minutes: "분 읽기",
    by: "지은이",
    star: "별점",
    spoiler: "스포일러 포함",
    reveal: "스포일러가 있어요. 전체 읽기에서 확인하세요.",
    heart: "하트",
    like: "좋아요",
    dislike: "싫어요",
    comment: "댓글",
    share: "공유",
    bookmark: "저장",
    bookmarked: "저장됨",
    close: "닫기",
    next: "다음 이야기",
    previous: "이전 이야기",
    readerHint: "아래로 스크롤하며 읽어보세요",
    readerEmpty: "먼저 읽을 이야기를 찾아주세요.",
    comments: "함께 나누는 생각",
    commentPlaceholder: "다정한 한마디를 남겨주세요…",
    sendComment: "댓글 남기기",
    noComments: "아직 댓글이 없어요. 첫 생각을 나눠주세요.",
    delete: "삭제",
    deletePost:
      "이 글을 삭제할까요? 공개 네트워크의 외부 복사본까지 삭제되지는 않을 수 있습니다.",
    deleteComment: "이 댓글을 삭제할까요?",
    removed: "삭제했어요.",
    hidden: "이 작성자의 글을 이 브라우저에서 숨겼어요.",
    hide: "이 작성자 숨기기",
    identityHint: "닉네임 뒤의 고유 번호로 작성자를 구분합니다.",
    profileTitle: "당신을 뭐라고 부를까요?",
    profileIntro: "회원가입 없이, 편한 이름으로 시작하세요.",
    nameLabel: "사용할 이름",
    nameHint: "2~30자 · 연결된 커뮤니티에서 사용 중인 이름은 피해주세요.",
    saveName: "이름 저장",
    savedName: "이름을 저장했어요.",
    profileNote:
      "글을 관리하는 키는 이 브라우저에 보관됩니다. 브라우저 데이터를 지우거나 기기를 바꾸기 전에 키를 백업하세요. 이름만 입력해서 다른 사람의 글을 지울 수는 없습니다.",
    backup: "글 관리 키 백업",
    restore: "백업 키 복원",
    backupWarning:
      "키 파일을 가진 사람은 내 이름으로 글을 쓰거나 삭제할 수 있습니다. 비밀번호처럼 안전하게 보관하고 다른 사람에게 보내지 마세요.",
    restoreConfirm:
      "이 브라우저의 현재 작성자 키를 바꿀까요? 현재 키를 먼저 백업하세요.",
    restoreDone: "키를 복원했습니다. 새로고침합니다.",
    resetHidden: "숨긴 작성자 다시 표시",
    resetDone: "숨긴 작성자를 다시 표시합니다.",
    category: "주제",
    select: "선택해주세요",
    author: "저자",
    authorPlaceholder: "책을 쓴 작가 이름",
    rating: "나의 별점",
    unrated: "별점 없음",
    optionalImage: "사진 첨부 (선택)",
    imageHint: "JPG · PNG · WebP · GIF / 최대 8MB. 공유 권한이 있는 이미지만.",
    imageChoose: "사진 선택",
    imageRemove: "사진 빼기",
    imageFit: "사진 표시",
    contain: "전체 보이기",
    cover: "꽉 채우기",
    spoilerLabel: "결말이나 스포일러가 포함되어 있어요",
    publish: "공개로 올리기",
    publishing: "공개 게시 중…",
    uploading: "사진을 업로드하고 있어요…",
    publishDone: "이야기를 공유했어요!",
    draft: "입력한 글은 이 브라우저에 임시 저장됩니다.",
    discard: "임시 글 지우기",
    discardConfirm: "이 브라우저에 저장한 임시 글을 지울까요?",
    length: "자",
    guide: "이용 안내",
    helpTitle: "편하게 쓰고, 안전하게 나눠요.",
    helpBody:
      "이곳의 글과 댓글은 로그인 없이 누구나 읽을 수 있는 공개 콘텐츠입니다. 글은 여러 공개 Nostr 중계 서버에, 사진은 외부 공개 이미지 서비스에 저장됩니다. 비밀번호, 연락처, 주소 등 민감한 내용은 올리지 마세요.",
    helpMore:
      "외부 서비스의 운영 상태에 따라 글이나 사진을 불러오지 못할 수 있으며 영구 보관은 보장되지 않습니다. 작성자가 삭제하면 이 사이트에서는 숨겨지지만, 외부에 복사된 내용까지 완전히 삭제할 수는 없습니다. 중요한 원본은 따로 보관하세요.",
    helpIdentity:
      "작성 권한은 닉네임이 아니라 브라우저의 서명 키로 확인합니다. 이름 중복은 현재 연결된 서버에서 확인하며, 전 세계에서 동시에 등록되는 이름을 완벽하게 잠그는 방식은 아닙니다.",
    helpRules:
      "서로를 존중해주세요. 개인정보 노출, 괴롭힘, 혐오, 불법 콘텐츠와 무단 복제는 올리지 마세요. 불편한 작성자는 글 안의 숨기기 기능으로 내 화면에서 가릴 수 있습니다.",
    shareTitle: "이 이야기를 함께 읽어요",
    copy: "링크 복사",
    copied: "공유 링크를 복사했어요.",
    copyHint: "링크를 복사해서 다른 사람에게 보내주세요.",
    notFound: "글이 없거나 작성자가 삭제했어요.",
    loadingDetail: "이야기를 불러오는 중…",
    savedToast: "이 브라우저의 읽을거리에 저장했어요.",
    unsavedToast: "저장 목록에서 뺐어요.",
    networkError:
      "연결이 원활하지 않아 완료하지 못했어요. 잠시 후 다시 시도해주세요.",
    invalid: "필수 항목과 글자 수를 확인해주세요.",
    taken: "현재 사용 중인 이름이에요. 다른 이름을 정해주세요.",
    nameError: "이름은 2~30자로 입력해주세요.",
    ownerError: "작성자만 삭제할 수 있어요.",
    imageError: "8MB 이하의 정상적인 JPG, PNG, WebP, GIF 사진을 선택해주세요.",
    uploadError: "사진을 올리지 못했어요. 글은 남아 있으니 다시 시도해주세요.",
    backupError: "이 사이트에서 내려받은 올바른 백업 파일이 아니에요.",
    storageError: "브라우저 저장 공간을 사용할 수 없어요. 설정을 확인해주세요.",
    failedInit:
      "이 브라우저에서 작성자 키를 만들 수 없어요. 저장 공간을 허용한 뒤 다시 열어주세요.",
    loadingSocial: "반응을 불러오는 중",
    socialError: "반응을 불러오지 못했어요. 새로고침을 눌러주세요.",
    publicNote: "모든 글은 공개됩니다 · 개인정보는 남기지 마세요",
    library: "함께 만드는 작은 공간들",
    recipe: "Recipe Story · 레시피",
    book: "Book Story · 책",
    story: "Story Room · 썰",
    language: "언어",
    inspiration: "이 주제로 써보기",
    composerTitle: "새 이야기",
    shareFallback: "복사가 제한되어 있어요. 위 링크를 길게 눌러 복사해주세요.",
  },
  en: {
    discover: "Discover",
    reader: "Swipe & read",
    savedLabel: "Saved posts",
    name: "Choose a name",
    searchLabel: "Search posts",
    all: "All",
    newest: "Newest first",
    oldest: "Oldest first",
    refresh: "Refresh",
    reading: "Good reads, better together.",
    public: "Public community",
    connecting: "Connecting",
    offline: "Connection needed",
    loading: "Finding the latest stories…",
    errorTitle: "We couldn’t load the stories.",
    errorBody:
      "Check your connection and try again. Your draft is still saved in this browser.",
    retry: "Try again",
    filteredTitle: "No stories match just yet.",
    filteredBody: "Try a different search or topic, or start the conversation.",
    clear: "Clear filters",
    savedEmpty: "Keep the stories you love.",
    savedHint: "Tap a bookmark to save a post in this browser.",
    mineEmpty: "Your first story starts here.",
    count: " stories",
    readMore: "Read the full story",
    write: "Write",
    minutes: "min read",
    by: "by",
    star: "Rating",
    spoiler: "Contains spoilers",
    reveal: "Contains spoilers. Open the full story to read.",
    heart: "Heart",
    like: "Like",
    dislike: "Dislike",
    comment: "Comment",
    share: "Share",
    bookmark: "Save",
    bookmarked: "Saved",
    close: "Close",
    next: "Next story",
    previous: "Previous story",
    readerHint: "Scroll down for the next story",
    readerEmpty: "Find a story to read first.",
    comments: "Join the conversation",
    commentPlaceholder: "Leave a kind thought…",
    sendComment: "Post comment",
    noComments: "No comments yet. Share the first thought.",
    delete: "Delete",
    deletePost:
      "Delete this post? Copies outside this site may remain on the public network.",
    deleteComment: "Delete this comment?",
    removed: "Deleted.",
    hidden: "This author is hidden in this browser.",
    hide: "Hide this author",
    identityHint: "The short ID distinguishes people with similar names.",
    profileTitle: "What should we call you?",
    profileIntro: "No sign-up. Just a name that feels like you.",
    nameLabel: "Your display name",
    nameHint:
      "2–30 characters. Choose a name not already used on connected relays.",
    saveName: "Save name",
    savedName: "Your name is saved.",
    profileNote:
      "Your author key stays in this browser. Back it up before clearing browser data or switching devices. Knowing someone’s name does not grant access to their posts.",
    backup: "Back up author key",
    restore: "Restore author key",
    backupWarning:
      "Anyone with this key file can post or delete as you. Keep it safe, like a password. Never share it.",
    restoreConfirm:
      "Replace the author key in this browser? Back up your current key first.",
    restoreDone: "Key restored. Reloading…",
    resetHidden: "Unhide all authors",
    resetDone: "All authors are visible again.",
    category: "Topic",
    select: "Choose a topic",
    author: "Author",
    authorPlaceholder: "Who wrote the book?",
    rating: "Your rating",
    unrated: "No rating",
    optionalImage: "Add a photo (optional)",
    imageHint:
      "JPG · PNG · WebP · GIF / up to 8 MB. Only images you have permission to share.",
    imageChoose: "Choose a photo",
    imageRemove: "Remove photo",
    imageFit: "Image fit",
    contain: "Show full image",
    cover: "Fill the frame",
    spoilerLabel: "This story includes spoilers",
    publish: "Publish for everyone",
    publishing: "Publishing…",
    uploading: "Uploading your photo…",
    publishDone: "Your story is shared!",
    draft: "Your draft is saved in this browser.",
    discard: "Clear draft",
    discardConfirm: "Clear the draft saved in this browser?",
    length: "characters",
    guide: "Community guide",
    helpTitle: "An open room. A little care.",
    helpBody:
      "Posts and comments here are public and readable without an account. They are stored on public Nostr relays, and images on external public image services. Do not publish passwords, contact details, addresses, or private information.",
    helpMore:
      "External services may become unavailable; permanent storage is not guaranteed. Deleting a post hides it here, but cannot erase copies made elsewhere. Keep your own copies of important content.",
    helpIdentity:
      "Your signing key, not your display name, proves authorship. Name availability is checked on connected relays; it is not a globally locked username registry.",
    helpRules:
      "Respect one another. No private information, harassment, hateful content, illegal material, or unauthorized copies. You can hide an author from your own view inside a post.",
    shareTitle: "A story worth sharing",
    copy: "Copy link",
    copied: "Link copied.",
    copyHint: "Send this link to someone you’d like to share it with.",
    notFound: "This post is missing or has been removed.",
    loadingDetail: "Opening the story…",
    savedToast: "Saved to your reading list in this browser.",
    unsavedToast: "Removed from your reading list.",
    networkError:
      "We couldn’t complete that. Check your connection and try again.",
    invalid: "Check the required fields and character limits.",
    taken: "That name is already in use. Try another name.",
    nameError: "Your name must be 2–30 characters.",
    ownerError: "Only the author can delete this.",
    imageError: "Choose a valid JPG, PNG, WebP, or GIF image under 8 MB.",
    uploadError:
      "The photo could not be uploaded. Your draft is safe; please try again.",
    backupError: "This is not a valid key backup for this site.",
    storageError:
      "Browser storage is unavailable. Please check your browser settings.",
    failedInit:
      "This browser cannot save your author key. Allow local storage and reopen the page.",
    loadingSocial: "Loading reactions",
    socialError: "Could not load reactions. Please refresh.",
    publicNote: "All posts are public · Keep private details private",
    library: "Little spaces, made together",
    recipe: "Recipe Story · food",
    book: "Book Story · books",
    story: "Story Room · stories",
    language: "Language",
    inspiration: "Write about this",
    composerTitle: "A new story",
    shareFallback:
      "Copying is blocked. Select the link above and copy it manually.",
  },
};
const T = (key) => C.texts[lang][key] ?? words[lang][key] ?? key;
const paths = {
  home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z",
  book: "M3 4q5-2 9 2 4-4 9-2v15q-5-2-9 2-4-4-9-2zM12 6v15",
  story: "M4 3h16a1 1 0 0 1 1 1v12H11l-6 5v-5H3V4a1 1 0 0 1 1-1",
  reader: "M5 3h14v18H5zM9 8l3-3 3 3M9 16l3 3 3-3",
  saved: "M6 3h12v18l-6-4-6 4z",
  user: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a8 8 0 0 1 16 0v2",
  plus: "M12 5v14M5 12h14",
  search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  arrow: "M5 12h14m-5-5 5 5-5 5",
  close: "M6 6l12 12M6 18 18 6",
  refresh: "M20 7a9 9 0 1 0 1 8M20 2v6h-6",
  heart:
    "M20.5 5.5a5 5 0 0 0-8.5 3 5 5 0 0 0-8.5-3C-1 10 6 17 12 21c6-4 13-11 8.5-15.5",
  like: "M7 21H3V10h4m0 11h10a2 2 0 0 0 2-2l2-7a2 2 0 0 0-2-2h-6l1-6c0-2-3-3-4 0l-3 6z",
  dislike:
    "M7 3H3v11h4m0-11h10a2 2 0 0 1 2 2l2 7a2 2 0 0 1-2 2h-6l1 6c0 2-3 3-4 0l-3-6z",
  comment: "M21 11a9 9 0 0 1-9 9H3l2-5a9 9 0 1 1 16-4",
  share: "M12 16V3m-5 5 5-5 5 5M4 13v8h16v-8",
  check: "m5 12 4 4L20 5",
  chevron: "m8 5 7 7-7 7",
  down: "m5 9 7 7 7-7",
  up: "m5 15 7-7 7 7",
  image: "M3 3h18v18H3zM3 17l6-7 5 6 3-3 4 4M16 7h.01",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  globe:
    "M3 12h18M12 3a16 16 0 0 1 0 18 16 16 0 0 1 0-18M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
  shield: "m12 3 8 3v7c0 4-8 8-8 8s-8-4-8-8V6zM8 12l3 3 5-6",
};
const icon = (name) =>
  '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="' +
  (paths[name] || paths.book) +
  '"/></svg>';
const button = (action, label, ic, extra = "", cls = "") =>
  '<button type="button" class="' +
  cls +
  '" data-action="' +
  action +
  '" ' +
  extra +
  ">" +
  (ic ? icon(ic) : "") +
  "<span>" +
  esc(label) +
  "</span></button>";
const iconButton = (action, label, ic, extra = "") =>
  '<button type="button" class="icon-button" data-action="' +
  action +
  '" aria-label="' +
  esc(label) +
  '" title="' +
  esc(label) +
  '" ' +
  extra +
  ">" +
  icon(ic) +
  "</button>";
let backend;
try {
  backend = createCommunity(C);
} catch {
  $("#app").innerHTML =
    '<main class="boot"><h1>' +
    esc(C.brand) +
    "</h1><p>" +
    esc(T("failedInit")) +
    "</p></main>";
  throw new Error("Browser identity unavailable");
}
let name = read("name", ""),
  posts = [],
  category = "all",
  scope = "discover",
  query = "",
  order = "newest",
  loading = true,
  failed = false;
let saved = new Set(read("saved", [])),
  hidden = new Set(read("hidden", [])),
  current = null,
  afterName = null,
  readerItems = [],
  readerObserver,
  readerIndex = 0;
let file = null,
  previewURL = "",
  uploadedImage = null,
  writing = false,
  fetchVersion = 0;
const stats = new Map(),
  locks = new Set(),
  statVersions = new Map();
let cardObserver;
const errorText = (e) =>
  T(
    {
      offline: "networkError",
      invalid: "invalid",
      taken: "taken",
      name: "nameError",
      owner: "ownerError",
      image: "imageError",
      upload: "uploadError",
      backup: "backupError",
    }[e?.message] || "networkError",
  );
let toastTimer;
function toast(message) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 4500);
}
function dialog(id) {
  const el = $("#" + id);
  if (!el.open) el.showModal();
  document.body.classList.add("modal-open");
}
function close(id) {
  $("#" + id).close();
  if (!all("dialog[open]").length) {
    document.body.classList.remove("modal-open");
    if (document.activeElement?.classList.contains("skip"))
      $("#feed").focus({ preventScroll: true });
  }
}
function catLabel(id) {
  return C.categories.find((c) => c.id === id)?.[lang] || T("all");
}
function date(created) {
  return new Intl.DateTimeFormat(lang === "ko" ? "ko-KR" : "en-US", {
    month: "short",
    day: "numeric",
  }).format(created * 1000);
}
function byline(p) {
  return (
    '<div class="byline"><span class="avatar">' +
    esc([...p.name][0] || "?") +
    "</span><span><b>" +
    esc(p.name) +
    '</b><small title="' +
    esc(T("identityHint")) +
    '">#' +
    p.userId.slice(0, 6) +
    " · " +
    date(p.created) +
    "</small></span></div>"
  );
}
function heroArt() {
  if (C.type === "book")
    return '<div class="hero-art book-art" aria-hidden="true"><span class="art-caption">A SHELF OF POSSIBILITIES</span><div class="art-orbit"></div><div class="display-book back"><span>STORIES<br>STAY<br>WITH US.</span><i>OPEN A NEW CHAPTER</i></div><div class="display-book front"><small>THE READING LIFE</small><strong>One<br>more<br><em>page.</em></strong><span class="book-star">✳</span><i>NOTES FROM THE MARGINS</i></div><span class="art-spark">✦</span><span class="art-footer">GOOD BOOKS, BETTER COMPANY.</span></div>';
  return '<div class="hero-art room-art" aria-hidden="true"><span class="art-caption">THERE’S ALWAYS A STORY</span><div class="art-orbit"></div><div class="speech-note note-back"><small>A MOMENT TO REMEMBER</small><b>Wait,<br>what<br>happened?</b><span>···</span></div><div class="speech-note note-front"><small>THE LITTLE THINGS</small><b>It all<br>started<br><em>like this.</em></b><span>♡</span></div><span class="art-spark">✦</span><span class="art-footer">PULL UP A CHAIR. STAY A WHILE.</span></div>';
}
function renderShell() {
  document.documentElement.lang = lang;
  document.body.dataset.site = C.type;
  document.title = C.brand + " — " + T("subtitle");
  const nav = (cls) =>
    '<nav class="' +
    cls +
    '" aria-label="' +
    esc(C.brand) +
    '">' +
    button(
      "scope",
      T("discover"),
      "home",
      'data-scope="discover" class="active"',
    ) +
    button("reader", T("reader"), "reader") +
    button("scope", T("savedLabel"), "saved", 'data-scope="saved"') +
    button("scope", T("mine"), "user", 'data-scope="mine"') +
    "</nav>";
  $("#app").innerHTML =
    '<aside class="sidebar"><a class="brand" href="./"><img src="./favicon.svg" alt=""><span>' +
    C.brand +
    "<small>" +
    esc(T("subtitle")) +
    '</small></span></a><div class="sidebar-label">YOUR LITTLE CORNER</div>' +
    nav("side-nav") +
    button("compose", T("create"), "plus", "", "primary side-compose") +
    '<div class="sidebar-bottom"><div class="sidebar-note">' +
    icon(C.type) +
    "<p>" +
    T("note") +
    "</p></div>" +
    button("help", T("guide"), "shield") +
    "<small>© " +
    new Date().getFullYear() +
    " " +
    C.brand +
    "</small></div></aside>" +
    '<div class="workspace"><header class="topbar"><a class="mobile-brand" href="./"><img src="./favicon.svg" alt="">' +
    C.brand +
    '</a><label class="search">' +
    icon("search") +
    '<input id="searchInput" type="search" placeholder="' +
    esc(T("search")) +
    '" aria-label="' +
    esc(T("searchLabel")) +
    '"></label><div class="top-actions"><label class="language">' +
    icon("globe") +
    '<select id="language" aria-label="' +
    T("language") +
    '"><option value="ko" ' +
    (lang === "ko" ? "selected" : "") +
    '>한국어</option><option value="en" ' +
    (lang === "en" ? "selected" : "") +
    ">EN</option></select></label>" +
    button("profile", name || T("name"), "user", "", "profile-button") +
    "</div></header>" +
    '<main><section class="hero"><div class="hero-copy"><p class="eyebrow">' +
    T("eyebrow") +
    "</p><h1>" +
    T("hero") +
    '</h1><p class="hero-intro">' +
    T("intro") +
    '</p><div class="hero-actions">' +
    button("compose", T("create"), "plus", "", "primary") +
    button("reader", T("reader"), "arrow", "", "text-button") +
    '</div><div class="hero-foot"><span class="tiny-dot"></span>' +
    esc(T("reading")) +
    "</div></div>" +
    heroArt() +
    "</section>" +
    '<section id="feed" class="feed-section" tabindex="-1"><div class="section-top"><div><p class="eyebrow">THE COMMUNITY</p><h2 id="feedTitle">' +
    esc(T("feed")) +
    '</h2></div><div class="feed-tools"><span id="feedCount"></span>' +
    iconButton("refresh", T("refresh"), "refresh") +
    '</div></div><div id="categories" class="categories" aria-label="' +
    esc(T("category")) +
    '">' +
    button(
      "category",
      T("all"),
      null,
      'data-category="all" aria-pressed="true"',
      "category-pill all-pill",
    ) +
    C.categories
      .map(
        (c, i) =>
          '<button class="category-pill" data-action="category" data-category="' +
          c.id +
          '" aria-pressed="false"><span class="category-dot dot-' +
          (i % 7) +
          '">' +
          c.letter +
          "</span>" +
          esc(c[lang]) +
          "</button>",
      )
      .join("") +
    '</div><div class="feed-subhead"><span class="connection" id="connection"><i></i>' +
    esc(T("connecting")) +
    '</span><select id="sort" aria-label="' +
    esc(T("newest")) +
    '"><option value="newest">' +
    esc(T("newest")) +
    '</option><option value="oldest">' +
    esc(T("oldest")) +
    '</option></select></div><div id="grid" class="post-grid" aria-busy="true"></div></section>' +
    '<section class="prompts"><div><p class="eyebrow">A LITTLE INSPIRATION</p><h2>' +
    esc(T("promptTitle")) +
    '</h2></div><div class="prompt-list">' +
    C.texts[lang].prompts
      .map(
        (p, i) =>
          '<button data-action="prompt" data-prompt="' +
          i +
          '"><span>0' +
          (i + 1) +
          "</span><b>" +
          esc(p) +
          "</b>" +
          icon("arrow") +
          "</button>",
      )
      .join("") +
    "</div></section>" +
    "<footer><span>" +
    C.brand +
    " <small>" +
    esc(T("library")) +
    '</small></span><div><a href="https://dohoon819.github.io/hanip-recipe/">' +
    esc(T("recipe")) +
    '</a><a href="https://dohoon819.github.io/' +
    (C.type === "book" ? "story-room/" : "book-story/") +
    '">' +
    esc(T(C.type === "book" ? "story" : "book")) +
    '</a><button data-action="help">' +
    esc(T("guide")) +
    "</button></div><p>" +
    esc(T("publicNote")) +
    "</p></footer></main></div>" +
    nav("bottom-nav") +
    '<button class="floating-write" data-action="compose" aria-label="' +
    esc(T("create")) +
    '">' +
    icon("plus") +
    "</button>" +
    '<dialog id="profileDialog" class="sheet profile-sheet"><div class="dialog-head"><span class="eyebrow">HELLO, YOU.</span>' +
    iconButton("close", T("close"), "close", 'data-dialog="profileDialog"') +
    "</div><h2>" +
    esc(T("profileTitle")) +
    '</h2><p class="muted">' +
    esc(T("profileIntro")) +
    '</p><form id="profileForm"><label>' +
    esc(T("nameLabel")) +
    '<input id="nameInput" minlength="2" maxlength="30" required autocomplete="nickname"></label><small>' +
    esc(T("nameHint")) +
    '</small><p class="form-message" id="nameMessage" role="status"></p><button type="submit" class="primary">' +
    esc(T("saveName")) +
    icon("arrow") +
    '</button></form><div class="notice">' +
    icon("shield") +
    "<p>" +
    esc(T("profileNote")) +
    "</p></div><details><summary>" +
    esc(T("backup")) +
    " / " +
    esc(T("restore")) +
    '</summary><p class="small">' +
    esc(T("backupWarning")) +
    '</p><div class="backup-actions">' +
    button("backup", T("backup"), null) +
    button("restore", T("restore"), null) +
    '</div><input id="restoreFile" type="file" accept=".json,application/json" hidden></details>' +
    button("unhide", T("resetHidden"), null, "", "text-button") +
    "</dialog>" +
    '<dialog id="composeDialog" class="sheet compose-sheet"><div class="dialog-head"><span class="eyebrow">MAKE A LITTLE CONNECTION</span>' +
    iconButton("close", T("close"), "close", 'data-dialog="composeDialog"') +
    "</div><h2>" +
    esc(T("create")) +
    '</h2><p class="muted draft-note">' +
    esc(T("draft")) +
    '</p><form id="composeForm"><label>' +
    esc(T("titleLabel")) +
    '<input name="title" id="postTitle" minlength="2" maxlength="100" placeholder="' +
    esc(T("titlePlaceholder")) +
    '" required></label>' +
    (C.type === "book"
      ? '<div class="form-row"><label>' +
        esc(T("author")) +
        '<input name="author" id="postAuthor" maxlength="80" placeholder="' +
        esc(T("authorPlaceholder")) +
        '" required></label><label>' +
        esc(T("rating")) +
        '<select name="rating" id="postRating"><option value="0">' +
        esc(T("unrated")) +
        "</option>" +
        [5, 4, 3, 2, 1]
          .map(
            (n) => '<option value="' + n + '">' + "★".repeat(n) + "</option>",
          )
          .join("") +
        "</select></label></div>"
      : "") +
    "<label>" +
    esc(T("category")) +
    '<select name="category" id="postCategory" required><option value="">' +
    esc(T("select")) +
    "</option>" +
    C.categories
      .map((c) => '<option value="' + c.id + '">' + esc(c[lang]) + "</option>")
      .join("") +
    "</select></label><label>" +
    esc(T("bodyLabel")) +
    '<textarea name="body" id="postBody" rows="7" minlength="20" maxlength="' +
    C.maxBody +
    '" placeholder="' +
    esc(T("bodyPlaceholder")) +
    '" required></textarea><small id="bodyCount">0 / ' +
    C.maxBody +
    "</small></label>" +
    '<div class="upload-box"><div><b>' +
    esc(T("optionalImage")) +
    "</b><p>" +
    esc(T("imageHint")) +
    '</p></div><label class="upload-button">' +
    icon("image") +
    esc(T("imageChoose")) +
    '<input type="file" id="imageFile" accept="image/jpeg,image/png,image/webp,image/gif"></label><div id="imagePreview"></div><label id="fitLabel" hidden>' +
    esc(T("imageFit")) +
    '<select id="imageFit"><option value="contain">' +
    esc(T("contain")) +
    '</option><option value="cover">' +
    esc(T("cover")) +
    '</option></select></label></div><label class="check-label"><input type="checkbox" name="spoiler" id="postSpoiler">' +
    esc(T("spoilerLabel")) +
    '</label><label class="check-label consent"><input type="checkbox" id="consent" required>' +
    esc(T("privacy")) +
    '</label><p class="form-message" id="postMessage" role="status"></p><div class="composer-actions">' +
    button("discard", T("discard"), null, "", "text-button") +
    '<button type="submit" class="primary" id="publishButton">' +
    esc(T("publish")) +
    icon("arrow") +
    "</button></div></form></dialog>" +
    '<dialog id="detailDialog" class="sheet detail-sheet"><div class="dialog-head"><span class="eyebrow">' +
    C.brand +
    "</span>" +
    iconButton("close", T("close"), "close", 'data-dialog="detailDialog"') +
    '</div><div id="detailContent"></div></dialog>' +
    '<dialog id="readerDialog" class="reader-dialog"><header><span>' +
    icon("reader") +
    " " +
    esc(T("reader")) +
    '</span><small id="readerPosition"></small>' +
    iconButton("close", T("close"), "close", 'data-dialog="readerDialog"') +
    '</header><div id="readerScroller" tabindex="0" aria-label="' +
    esc(T("readerHint")) +
    '"></div><div class="reader-controls">' +
    iconButton("prev", T("previous"), "up") +
    iconButton("next", T("next"), "down") +
    "</div></dialog>" +
    '<dialog id="helpDialog" class="sheet help-sheet"><div class="dialog-head">' +
    icon("shield") +
    iconButton("close", T("close"), "close", 'data-dialog="helpDialog"') +
    "</div><h2>" +
    esc(T("helpTitle")) +
    "</h2><p>" +
    esc(T("helpBody")) +
    "</p><p>" +
    esc(T("helpIdentity")) +
    "</p><p>" +
    esc(T("helpMore")) +
    "</p><p>" +
    esc(T("helpRules")) +
    '</p><div class="notice"><p>' +
    esc(T("privacy")) +
    "</p></div></dialog>" +
    '<dialog id="shareDialog" class="sheet"><div class="dialog-head"><span class="eyebrow">PASS IT ON</span>' +
    iconButton("close", T("close"), "close", 'data-dialog="shareDialog"') +
    "</div><h2>" +
    esc(T("shareTitle")) +
    "</h2><p>" +
    esc(T("copyHint")) +
    '</p><input id="shareUrl" readonly aria-label="' +
    esc(T("share")) +
    '">' +
    button("copy", T("copy"), "share", "", "primary") +
    '</dialog><div id="toast" role="status" aria-live="polite"></div>';
  attachForms();
  renderFeed();
}
function filtered() {
  const term = query.trim().toLocaleLowerCase();
  return posts
    .filter(
      (p) =>
        !hidden.has(p.userId) &&
        (scope !== "saved" || saved.has(p.id)) &&
        (scope !== "mine" || p.userId === backend.userId) &&
        (category === "all" || p.category === category) &&
        (!term ||
          [p.title, p.author, p.body, p.name]
            .join(" ")
            .toLocaleLowerCase()
            .includes(term)),
    )
    .sort((a, b) =>
      order === "oldest" ? a.created - b.created : b.created - a.created,
    );
}
function imageMarkup(p, cls = "") {
  const url = safeUrl(p.image?.url);
  if (url)
    return (
      '<div class="post-image ' +
      cls +
      '"><img src="' +
      esc(url) +
      '" alt="' +
      esc(p.title) +
      '" loading="lazy" referrerpolicy="no-referrer" style="object-fit:' +
      (p.image.fit === "cover" ? "cover" : "contain") +
      '"></div>'
    );
  if (C.type === "book")
    return (
      '<div class="generated-cover tone-' +
      (C.categories.findIndex((c) => c.id === p.category) % 5) +
      " " +
      cls +
      '"><div class="cover-spine"></div><span class="cover-label">FROM MY BOOKSHELF</span><strong>' +
      esc(p.title) +
      '</strong><span class="cover-decoration">✳</span><small>' +
      esc(p.author) +
      "</small></div>"
    );
  return "";
}
function statBar(p, compact = false) {
  const data = stats.get(p.id),
    mine = data?.mine,
    locked = locks.has(p.id),
    count = (k) => (data ? data[k] : "—");
  const react = (kind, label, ic, key, pressed) =>
    '<button data-action="react" data-kind="' +
    kind +
    '" data-id="' +
    p.id +
    '" aria-label="' +
    esc(label) +
    '" aria-pressed="' +
    Boolean(pressed) +
    '" ' +
    (!data || locked ? "disabled" : "") +
    ">" +
    icon(ic) +
    '<span data-count="' +
    key +
    '">' +
    count(key) +
    "</span></button>";
  return (
    '<div class="reaction-bar ' +
    (compact ? "compact" : "") +
    '" data-stats="' +
    p.id +
    '">' +
    react("heart", T("heart"), "heart", "hearts", mine?.heart) +
    (compact
      ? ""
      : react("like", T("like"), "like", "likes", mine?.vote === 1) +
        react(
          "dislike",
          T("dislike"),
          "dislike",
          "dislikes",
          mine?.vote === -1,
        )) +
    '<button data-action="comments" data-id="' +
    p.id +
    '" aria-label="' +
    esc(T("comment")) +
    '">' +
    icon("comment") +
    "<span>" +
    (data ? data.comments.length : "—") +
    '</span></button><span class="action-spacer"></span><button data-action="save" data-id="' +
    p.id +
    '" aria-label="' +
    esc(saved.has(p.id) ? T("bookmarked") : T("bookmark")) +
    '" aria-pressed="' +
    saved.has(p.id) +
    '">' +
    icon("saved") +
    '</button><button data-action="share" data-id="' +
    p.id +
    '" aria-label="' +
    esc(T("share")) +
    '">' +
    icon("share") +
    "</button></div>"
  );
}
function card(p) {
  return (
    '<article class="post-card" data-card="' +
    p.id +
    '"><div class="card-byline">' +
    byline(p) +
    '<span class="tag">' +
    esc(catLabel(p.category)) +
    '</span></div><button class="card-main" data-action="detail" data-id="' +
    p.id +
    '">' +
    imageMarkup(p) +
    '<div class="card-copy">' +
    (C.type === "story" ? '<span class="story-quote">“</span>' : "") +
    "<h3>" +
    esc(p.title) +
    "</h3>" +
    (C.type === "book"
      ? '<p class="book-author">' +
        esc(p.author) +
        (p.rating
          ? ' <span class="stars">' + "★".repeat(p.rating) + "</span>"
          : "") +
        "</p>"
      : "") +
    '<p class="excerpt ' +
    (p.spoiler ? "spoiler-excerpt" : "") +
    '">' +
    esc(p.spoiler ? T("reveal") : p.body) +
    '</p><span class="read-link">' +
    esc(p.spoiler ? T("spoiler") : T("readMore")) +
    icon("arrow") +
    "</span></div></button>" +
    statBar(p, true) +
    "</article>"
  );
}
function renderFeed() {
  const list = filtered();
  $("#feedTitle").textContent = T(
    scope === "mine" ? "mine" : scope === "saved" ? "saved" : "feed",
  );
  $("#feedCount").textContent =
    !loading && !failed ? list.length + T("count") : "";
  $("#grid").setAttribute("aria-busy", loading ? "true" : "false");
  all('[data-action="scope"]').forEach((b) => {
    b.classList.toggle("active", b.dataset.scope === scope);
    b.setAttribute(
      "aria-current",
      b.dataset.scope === scope ? "page" : "false",
    );
  });
  all("[data-category]").forEach((b) =>
    b.setAttribute(
      "aria-pressed",
      b.dataset.category === category ? "true" : "false",
    ),
  );
  $("#connection").className =
    "connection " +
    (failed ? "is-offline" : loading ? "is-loading" : "is-online");
  $("#connection").innerHTML =
    "<i></i>" + esc(T(failed ? "offline" : loading ? "connecting" : "public"));
  if (loading && !posts.length) {
    $("#grid").innerHTML =
      '<div class="loading-state"><span class="loader"></span><p>' +
      esc(T("loading")) +
      "</p></div>";
    return;
  }
  if (failed && !posts.length) {
    $("#grid").innerHTML =
      '<div class="empty-state">' +
      icon("refresh") +
      "<h3>" +
      esc(T("errorTitle")) +
      "</h3><p>" +
      esc(T("errorBody")) +
      "</p>" +
      button("refresh", T("retry"), "refresh", "", "primary") +
      "</div>";
    return;
  }
  if (!list.length) {
    const narrow = query || category !== "all";
    const title = narrow
      ? "filteredTitle"
      : scope === "saved"
        ? "savedEmpty"
        : scope === "mine"
          ? "mineEmpty"
          : "emptyTitle";
    const body = narrow
      ? "filteredBody"
      : scope === "saved"
        ? "savedHint"
        : "emptyBody";
    $("#grid").innerHTML =
      '<div class="empty-state"><div class="empty-icon">' +
      icon(C.type) +
      '</div><span class="eyebrow">YOUR NEXT CHAPTER</span><h3>' +
      esc(T(title)) +
      "</h3><p>" +
      T(body) +
      "</p>" +
      button(
        narrow ? "clear" : "compose",
        T(narrow ? "clear" : "create"),
        narrow ? "refresh" : "plus",
        "",
        "primary",
      ) +
      "</div>";
  } else {
    $("#grid").innerHTML = list.map(card).join("");
    cardObserver?.disconnect();
    cardObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            const id = entry.target.dataset.card;
            if (!stats.has(id)) loadStats(id);
            cardObserver.unobserve(entry.target);
          }
      },
      { rootMargin: "150px" },
    );
    all("[data-card]").forEach((el) => cardObserver.observe(el));
  }
}
let feedBusy = false;
async function refresh(show = false) {
  if (feedBusy) return;
  feedBusy = true;
  loading = true;
  failed = false;
  renderFeed();
  const version = ++fetchVersion;
  try {
    const next = await backend.feed();
    if (version !== fetchVersion) return;
    posts = next;
    loading = false;
    failed = false;
    renderFeed();
    if (show) toast(T("public"));
  } catch (e) {
    loading = false;
    failed = true;
    renderFeed();
    if (posts.length) toast(errorText(e));
  } finally {
    feedBusy = false;
  }
}
function updateStats(id) {
  const p = posts.find((p) => p.id === id) || current;
  if (!p || p.id !== id) return;
  all('[data-stats="' + id + '"]').forEach((el) => {
    el.outerHTML = statBar(p, el.classList.contains("compact"));
  });
  if (current?.id === id && $("#detailDialog").open) renderComments();
}
async function loadStats(id, force = false) {
  if (locks.has(id)) return;
  if (!force && stats.has(id)) return;
  const version = statVersions.get(id) || 0;
  try {
    const data = await backend.social(id);
    if (version !== (statVersions.get(id) || 0) || locks.has(id)) return;
    stats.set(id, data);
    updateStats(id);
    if (current?.id === id && $("#socialStatus"))
      $("#socialStatus").textContent = "";
  } catch {
    if (current?.id === id && $("#socialStatus"))
      $("#socialStatus").textContent = T("socialError");
  }
}
async function react(id, kind) {
  if (locks.has(id)) return;
  const data = stats.get(id);
  if (!data) {
    await loadStats(id, true);
    return;
  }
  const old = data.mine,
    next = { ...old };
  if (kind === "heart") next.heart = !old.heart;
  else
    next.vote =
      old.vote === (kind === "like" ? 1 : -1) ? 0 : kind === "like" ? 1 : -1;
  locks.add(id);
  statVersions.set(id, (statVersions.get(id) || 0) + 1);
  updateStats(id);
  try {
    await backend.react(id, next);
    stats.set(id, {
      ...data,
      mine: next,
      hearts: data.hearts + Number(next.heart) - Number(old.heart),
      likes: data.likes + Number(next.vote === 1) - Number(old.vote === 1),
      dislikes:
        data.dislikes + Number(next.vote === -1) - Number(old.vote === -1),
    });
  } catch (e) {
    toast(errorText(e));
  } finally {
    locks.delete(id);
    updateStats(id);
  }
}
function needsName(callback) {
  if (name) return false;
  afterName = callback;
  openProfile();
  return true;
}
function openProfile() {
  $("#nameInput").value = name;
  $("#nameMessage").textContent = "";
  dialog("profileDialog");
}
function getDraft() {
  const f = $("#composeForm");
  return {
    title: f.elements.title.value,
    author: f.elements.author?.value || "",
    rating: Number(f.elements.rating?.value || 0),
    category: f.elements.category.value,
    body: f.elements.body.value,
    spoiler: f.elements.spoiler.checked,
  };
}
function openCompose(promptIndex) {
  if (needsName(() => openCompose(promptIndex))) return;
  const draft = read("draft", {});
  for (const [key, value] of Object.entries(draft)) {
    const el = $("#composeForm").elements[key];
    if (el) {
      if (el.type === "checkbox") el.checked = Boolean(value);
      else el.value = value;
    }
  }
  if (promptIndex !== undefined && !$("#postBody").value)
    $("#postBody").placeholder =
      C.texts[lang].prompts[promptIndex] + "\n\n" + T("bodyPlaceholder");
  $("#bodyCount").textContent = $("#postBody").value.length + " / " + C.maxBody;
  $("#postMessage").textContent = "";
  dialog("composeDialog");
}
function clearImage() {
  file = null;
  uploadedImage = null;
  if (previewURL) URL.revokeObjectURL(previewURL);
  previewURL = "";
  $("#imageFile").value = "";
  $("#imagePreview").innerHTML = "";
  $("#fitLabel").hidden = true;
}
async function imageSelected() {
  const picked = $("#imageFile").files[0];
  if (!picked) return;
  if (
    !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
      picked.type,
    ) ||
    picked.size > 8 * 1024 * 1024
  ) {
    toast(T("imageError"));
    $("#imageFile").value = "";
    return;
  }
  const url = URL.createObjectURL(picked);
  try {
    await new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => (im.naturalWidth > 0 ? resolve() : reject());
      im.onerror = reject;
      im.src = url;
    });
    clearImage();
    file = picked;
    previewURL = url;
    $("#imagePreview").innerHTML =
      '<img src="' +
      url +
      '" alt="">' +
      button("removeImage", T("imageRemove"), "close", "", "text-button");
    $("#fitLabel").hidden = false;
  } catch {
    URL.revokeObjectURL(url);
    $("#imageFile").value = "";
    toast(T("imageError"));
  }
}
async function publishPost(event) {
  event.preventDefault();
  if (writing) return;
  if (needsName(() => {})) return;
  const value = getDraft();
  save("draft", value);
  writing = true;
  $("#composeForm").setAttribute("aria-busy", "true");
  all(
    '#composeForm input,#composeForm select,#composeForm textarea,#composeForm button,#composeDialog [data-action="close"]',
  ).forEach((el) => (el.disabled = true));
  try {
    $("#postMessage").textContent = T(file ? "uploading" : "publishing");
    if (file && !uploadedImage) uploadedImage = await backend.upload(file);
    const image = uploadedImage
      ? { ...uploadedImage, fit: $("#imageFit").value }
      : null;
    const post = await backend.post({ ...value, image, name });
    fetchVersion++;
    posts = [post, ...posts.filter((p) => p.id !== post.id)];
    stats.set(post.id, {
      hearts: 0,
      likes: 0,
      dislikes: 0,
      mine: { heart: false, vote: 0 },
      comments: [],
    });
    save("draft", null);
    $("#composeForm").reset();
    clearImage();
    scope = "discover";
    category = "all";
    query = "";
    $("#searchInput").value = "";
    failed = false;
    loading = false;
    close("composeDialog");
    renderFeed();
    $("#feed").scrollIntoView({ behavior: "smooth" });
    toast(T("publishDone"));
  } catch (e) {
    $("#postMessage").textContent = errorText(e);
  } finally {
    writing = false;
    $("#composeForm").setAttribute("aria-busy", "false");
    all(
      '#composeForm input,#composeForm select,#composeForm textarea,#composeForm button,#composeDialog [data-action="close"]',
    ).forEach((el) => (el.disabled = false));
  }
}
let detailLoad = 0;
async function openDetail(id, comments = false) {
  const version = ++detailLoad;
  current = posts.find((p) => p.id === id) || null;
  $("#detailContent").innerHTML =
    '<p class="muted">' + esc(T("loadingDetail")) + "</p>";
  dialog("detailDialog");
  if (!current) {
    try {
      current = await backend.getPost(id);
      if (version !== detailLoad) return;
      if (current) posts.push(current);
    } catch (e) {
      if (version === detailLoad)
        $("#detailContent").innerHTML =
          "<p>" +
          esc(errorText(e)) +
          "</p>" +
          button("detail", T("retry"), "refresh", 'data-id="' + esc(id) + '"');
      return;
    }
  }
  if (version !== detailLoad) return;
  if (!current) {
    $("#detailContent").innerHTML =
      '<div class="empty-state"><h2>' + esc(T("notFound")) + "</h2></div>";
    return;
  }
  const p = current;
  $("#detailContent").innerHTML =
    '<div class="detail-byline">' +
    byline(p) +
    '<span class="tag">' +
    esc(catLabel(p.category)) +
    "</span></div><h1>" +
    esc(p.title) +
    "</h1>" +
    (C.type === "book"
      ? '<p class="detail-author">' +
        esc(p.author) +
        (p.rating
          ? ' <span class="stars">' + "★".repeat(p.rating) + "</span>"
          : "") +
        "</p>"
      : "") +
    (p.spoiler ? '<p class="spoiler-tag">' + esc(T("spoiler")) + "</p>" : "") +
    imageMarkup(p, "detail-image") +
    '<div class="story-body">' +
    esc(p.body) +
    "</div>" +
    statBar(p) +
    '<div class="detail-utility">' +
    (p.userId === backend.userId
      ? button(
          "deletePost",
          T("delete"),
          null,
          'data-id="' + p.id + '"',
          "danger-text",
        )
      : button(
          "hide",
          T("hide"),
          null,
          'data-user="' + p.userId + '"',
          "text-button",
        )) +
    '</div><section id="commentSection"><div class="comment-heading"><h2>' +
    esc(T("comments")) +
    "</h2>" +
    iconButton(
      "refreshSocial",
      T("refresh"),
      "refresh",
      'data-id="' + p.id + '"',
    ) +
    '</div><p id="socialStatus" class="small" role="status">' +
    (stats.has(p.id) ? "" : esc(T("loadingSocial"))) +
    '</p><div id="comments"></div><form id="commentForm"><textarea id="commentBody" maxlength="1000" required rows="3" placeholder="' +
    esc(T("commentPlaceholder")) +
    '" aria-label="' +
    esc(T("comment")) +
    '"></textarea><div class="comment-submit"><small>' +
    esc(name || T("name")) +
    '</small><button type="submit" class="primary">' +
    esc(T("sendComment")) +
    '</button></div><p class="form-message" id="commentMessage" role="status"></p></form></section>';
  renderComments();
  $("#commentForm").addEventListener("submit", sendComment);
  await loadStats(id, true);
  if (comments && $("#detailDialog").open)
    $("#commentSection").scrollIntoView({ behavior: "smooth" });
}
function renderComments() {
  if (!$("#comments") || !current) return;
  const data = stats.get(current.id);
  if (!data) return;
  const list = data.comments.filter((c) => !hidden.has(c.userId));
  $("#comments").innerHTML = list.length
    ? list
        .map(
          (c) =>
            '<article class="comment"><div class="comment-author"><span class="avatar">' +
            esc([...c.name][0] || "?") +
            "</span><b>" +
            esc(c.name) +
            "</b><small>#" +
            c.userId.slice(0, 6) +
            "</small><time>" +
            date(c.created) +
            "</time></div><p>" +
            esc(c.body) +
            "</p>" +
            (c.userId === backend.userId
              ? button(
                  "deleteComment",
                  T("delete"),
                  null,
                  'data-comment="' + c.id + '" data-id="' + current.id + '"',
                  "text-button",
                )
              : "") +
            "</article>",
        )
        .join("")
    : '<p class="empty-comments">' + esc(T("noComments")) + "</p>";
}
async function sendComment(event) {
  event.preventDefault();
  if (!current || locks.has(current.id)) return;
  if (needsName(() => $("#commentBody")?.focus())) return;
  const id = current.id,
    body = $("#commentBody").value.trim();
  if (!body) return;
  const data = stats.get(id);
  if (!data) {
    await loadStats(id, true);
    return;
  }
  locks.add(id);
  statVersions.set(id, (statVersions.get(id) || 0) + 1);
  const submit = $('#commentForm button[type="submit"]');
  submit.disabled = true;
  $("#commentMessage").textContent = T("publishing");
  try {
    const comment = await backend.comment(id, body, name);
    stats.set(id, { ...data, comments: [...data.comments, comment] });
    if (current?.id === id) {
      $("#commentBody").value = "";
      $("#commentMessage").textContent = "";
    }
  } catch (e) {
    if (current?.id === id) $("#commentMessage").textContent = errorText(e);
  } finally {
    locks.delete(id);
    submit.disabled = false;
    updateStats(id);
  }
}
function openReader() {
  readerItems = filtered();
  if (!readerItems.length) {
    toast(T("readerEmpty"));
    return;
  }
  readerIndex = 0;
  $("#readerScroller").innerHTML = readerItems
    .map(
      (p, i) =>
        '<section class="reader-slide" data-index="' +
        i +
        '"><div class="reader-card ' +
        C.type +
        '-reader"><div class="reader-art">' +
        (C.type === "book"
          ? imageMarkup(p)
          : '<div class="reader-topic"><span>' +
            esc(catLabel(p.category)) +
            "</span><b>“</b></div>" +
            imageMarkup(p)) +
        '</div><div class="reader-copy">' +
        byline(p) +
        '<span class="tag">' +
        esc(catLabel(p.category)) +
        "</span><h2>" +
        esc(p.title) +
        "</h2>" +
        (C.type === "book"
          ? '<p class="book-author">' + esc(p.author) + "</p>"
          : "") +
        '<p class="reader-excerpt">' +
        esc(p.spoiler ? T("reveal") : p.body.slice(0, 620)) +
        "</p>" +
        button(
          "detail",
          T("readMore"),
          "arrow",
          'data-id="' + p.id + '"',
          "primary",
        ) +
        statBar(p) +
        "</div></div></section>",
    )
    .join("");
  dialog("readerDialog");
  $("#readerScroller").scrollTop = 0;
  $("#readerPosition").textContent = "1 / " + readerItems.length;
  readerObserver?.disconnect();
  readerObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries)
        if (entry.isIntersecting) {
          readerIndex = Number(entry.target.dataset.index);
          $("#readerPosition").textContent =
            readerIndex + 1 + " / " + readerItems.length;
          loadStats(readerItems[readerIndex].id, true);
        }
    },
    { root: $("#readerScroller"), threshold: 0.6 },
  );
  all(".reader-slide").forEach((el) => readerObserver.observe(el));
}
function readerMove(change) {
  const target = Math.max(
    0,
    Math.min(readerItems.length - 1, readerIndex + change),
  );
  $('.reader-slide[data-index="' + target + '"]')?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}
function shareURL(id) {
  const url = new URL(location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("post", id);
  return url.href;
}
async function share(id) {
  const url = shareURL(id),
    p = posts.find((p) => p.id === id);
  if (navigator.share) {
    try {
      await navigator.share({ title: p?.title || C.brand, text: C.brand, url });
      return;
    } catch (e) {
      if (e.name === "AbortError") return;
    }
  }
  $("#shareUrl").value = url;
  dialog("shareDialog");
  $("#shareUrl").select();
}
function attachForms() {
  $("#searchInput").addEventListener("input", (event) => {
    query = event.target.value;
    renderFeed();
  });
  $("#sort").addEventListener("change", (event) => {
    order = event.target.value;
    renderFeed();
  });
  $("#language").addEventListener("change", (event) => {
    clearImage();
    lang = event.target.value;
    save("lang", lang);
    renderShell();
  });
  $("#composeForm").addEventListener("input", () => {
    save("draft", getDraft());
    $("#bodyCount").textContent =
      $("#postBody").value.length + " / " + C.maxBody;
  });
  $("#composeForm").addEventListener("submit", publishPost);
  $("#imageFile").addEventListener("change", imageSelected);
  $("#profileForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const b = $('#profileForm button[type="submit"]');
    b.disabled = true;
    $("#nameMessage").textContent = T("publishing");
    try {
      name = await backend.setName($("#nameInput").value);
      save("name", name);
      all(".profile-button span").forEach((el) => (el.textContent = name));
      posts = posts.map((p) =>
        p.userId === backend.userId ? { ...p, name } : p,
      );
      renderFeed();
      close("profileDialog");
      toast(T("savedName"));
      const cb = afterName;
      afterName = null;
      cb?.();
    } catch (e) {
      $("#nameMessage").textContent = errorText(e);
    } finally {
      b.disabled = false;
    }
  });
  $("#restoreFile").addEventListener("change", async (event) => {
    const picked = event.target.files[0];
    if (!picked) return;
    try {
      if (picked.size > 4096) throw new Error("backup");
      const data = JSON.parse(await picked.text());
      if (!confirm(T("restoreConfirm"))) return;
      backend.restore(data);
      save("name", "");
      toast(T("restoreDone"));
      location.reload();
    } catch {
      toast(T("backupError"));
    } finally {
      event.target.value = "";
    }
  });
  $("#readerScroller").addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      readerMove(e.key === "ArrowDown" ? 1 : -1);
    }
  });
  all("dialog").forEach((el) => {
    el.addEventListener("cancel", (e) => {
      if (writing && el.id === "composeDialog") {
        e.preventDefault();
        return;
      }
    });
    el.addEventListener("close", () => {
      if (!all("dialog[open]").length)
        document.body.classList.remove("modal-open");
      if (el.id === "readerDialog") readerObserver?.disconnect();
      if (el.id === "detailDialog") detailLoad++;
    });
    el.addEventListener("click", (e) => {
      if (e.target !== el) return;
      const rect = el.getBoundingClientRect();
      if (
        (e.clientX < rect.left ||
          e.clientX > rect.right ||
          e.clientY < rect.top ||
          e.clientY > rect.bottom) &&
        !writing
      )
        close(el.id);
    });
  });
}
document.addEventListener("click", async (event) => {
  const b = event.target.closest("[data-action]");
  if (!b || b.disabled) return;
  const action = b.dataset.action,
    id = b.dataset.id;
  try {
    if (action === "close") {
      if (writing && b.dataset.dialog === "composeDialog") return;
      close(b.dataset.dialog);
    }
    if (action === "scope") {
      scope = b.dataset.scope;
      query = "";
      category = "all";
      $("#searchInput").value = "";
      renderFeed();
      $("#feed").scrollIntoView({ behavior: "smooth" });
    }
    if (action === "category") {
      category = b.dataset.category;
      renderFeed();
    }
    if (action === "clear") {
      query = "";
      category = "all";
      $("#searchInput").value = "";
      renderFeed();
    }
    if (action === "refresh") await refresh(true);
    if (action === "profile") openProfile();
    if (action === "compose") openCompose();
    if (action === "prompt") openCompose(Number(b.dataset.prompt));
    if (action === "reader") openReader();
    if (action === "next") readerMove(1);
    if (action === "prev") readerMove(-1);
    if (action === "help") dialog("helpDialog");
    if (action === "detail" || action === "comments") {
      if (
        current?.id === id &&
        $("#detailDialog").open &&
        action === "comments"
      )
        $("#commentSection").scrollIntoView({ behavior: "smooth" });
      else await openDetail(id, action === "comments");
    }
    if (action === "refreshSocial") await loadStats(id, true);
    if (action === "react") await react(id, b.dataset.kind);
    if (action === "save") {
      saved.has(id) ? saved.delete(id) : saved.add(id);
      save("saved", [...saved]);
      renderFeed();
      updateStats(id);
      toast(T(saved.has(id) ? "savedToast" : "unsavedToast"));
    }
    if (action === "share") await share(id);
    if (action === "copy") {
      try {
        await navigator.clipboard.writeText($("#shareUrl").value);
        toast(T("copied"));
      } catch {
        $("#shareUrl").select();
        toast(T("shareFallback"));
      }
    }
    if (action === "removeImage") clearImage();
    if (action === "discard" && confirm(T("discardConfirm"))) {
      $("#composeForm").reset();
      save("draft", null);
      clearImage();
      $("#bodyCount").textContent = "0 / " + C.maxBody;
    }
    if (action === "deletePost") {
      const p = posts.find((p) => p.id === id) || current;
      if (!p || !confirm(T("deletePost"))) return;
      b.disabled = true;
      await backend.removePost(p);
      posts = posts.filter((p) => p.id !== id);
      saved.delete(id);
      save("saved", [...saved]);
      close("detailDialog");
      if ($("#readerDialog").open) close("readerDialog");
      renderFeed();
      toast(T("removed"));
    }
    if (action === "deleteComment") {
      const data = stats.get(id),
        comment = data?.comments.find((c) => c.id === b.dataset.comment);
      if (!comment || locks.has(id) || !confirm(T("deleteComment"))) return;
      locks.add(id);
      statVersions.set(id, (statVersions.get(id) || 0) + 1);
      b.disabled = true;
      try {
        await backend.removeComment(id, comment);
        stats.set(id, {
          ...data,
          comments: data.comments.filter((c) => c.id !== comment.id),
        });
        toast(T("removed"));
      } finally {
        locks.delete(id);
        updateStats(id);
      }
    }
    if (action === "hide") {
      hidden.add(b.dataset.user);
      save("hidden", [...hidden]);
      close("detailDialog");
      if ($("#readerDialog").open) close("readerDialog");
      renderFeed();
      toast(T("hidden"));
    }
    if (action === "unhide") {
      hidden.clear();
      save("hidden", []);
      renderFeed();
      toast(T("resetDone"));
    }
    if (action === "backup") {
      const blob = new Blob([JSON.stringify(backend.backup(), null, 2)], {
          type: "application/json",
        }),
        url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = C.slug + "-PRIVATE-author-key.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast(T("backupWarning"));
    }
    if (action === "restore") $("#restoreFile").click();
  } catch (e) {
    toast(errorText(e));
    b.disabled = false;
  }
});
document.addEventListener(
  "error",
  (event) => {
    if (event.target.tagName === "IMG" && !event.target.dataset.failed) {
      event.target.dataset.failed = "true";
      event.target.classList.add("broken-image");
      event.target.alt = event.target.alt || T("imageError");
    }
  },
  true,
);
renderShell();
await refresh();
backend
  .getName()
  .then((value) => {
    if (value) {
      name = value;
      save("name", name);
      all(".profile-button span").forEach((el) => (el.textContent = name));
    }
  })
  .catch(() => {});
const sharedId = new URL(location.href).searchParams.get("post");
if (sharedId && /^[0-9a-f]{64}$/.test(sharedId)) await openDetail(sharedId);
setInterval(() => {
  if (!document.hidden && current && $("#detailDialog").open)
    loadStats(current.id, true);
}, 20000);
window.addEventListener("online", () => refresh());
window.addEventListener("beforeunload", (e) => {
  if (writing) {
    e.preventDefault();
    e.returnValue = "";
  }
});
