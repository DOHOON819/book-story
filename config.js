window.SITE_CONFIG = {
  slug: "book-story",
  type: "book",
  brand: "Book Story",
  short: "BS",
  tag: "dohoon-book-story-v1",
  maxBody: 6000,
  categories: [
    {
      id: "novel",
      ko: "소설",
      en: "Fiction",
      letter: "N",
    },
    {
      id: "essay",
      ko: "에세이",
      en: "Essays",
      letter: "E",
    },
    {
      id: "humanities",
      ko: "인문·사회",
      en: "Humanities",
      letter: "H",
    },
    {
      id: "growth",
      ko: "자기계발",
      en: "Personal growth",
      letter: "G",
    },
    {
      id: "science",
      ko: "과학·기술",
      en: "Science",
      letter: "S",
    },
    {
      id: "comic",
      ko: "만화·그림책",
      en: "Comics & art",
      letter: "C",
    },
    {
      id: "other",
      ko: "그 밖의 책",
      en: "More books",
      letter: "+",
    },
  ],
  texts: {
    ko: {
      subtitle: "책으로 만나는 취향",
      eyebrow: "A LITTLE SHELF, A BIG WORLD",
      hero: "한 권의 책,<br>수많은 새로운 시선.",
      intro:
        "마음에 남은 책을 꺼내 놓으세요.<br>누군가의 다음 인생 책이 될지도 몰라요.",
      create: "책 이야기 쓰기",
      feed: "함께 읽는 책장",
      mine: "내 책 이야기",
      saved: "나의 읽을거리",
      search: "책 제목, 저자, 이야기를 찾아보세요",
      titleLabel: "책 제목",
      titlePlaceholder: "어떤 책을 읽으셨나요?",
      bodyLabel: "이 책을 추천하는 이유",
      bodyPlaceholder:
        "마음에 남은 장면, 읽고 달라진 생각, 이 책이 필요한 사람에게 전하고 싶은 이야기를 적어주세요. (20자 이상)",
      emptyTitle: "이 책장의 첫 이야기를 기다려요.",
      emptyBody:
        "좋아하는 책 한 권과 당신의 감상을 나눠주세요.<br>실제 독자들이 올린 글이 이곳에 모입니다.",
      privacy:
        "직접 쓴 감상과 공유 권한이 있는 이미지만 올립니다. 책 전문·스캔본은 공유하지 않습니다.",
      promptTitle: "어떤 책을 꺼내 볼까요?",
      prompts: [
        "누군가에게 꼭 선물하고 싶은 책",
        "마지막 장을 덮고도 생각나는 책",
        "올해 나를 조금 바꾼 책",
      ],
      note: "책은 더 오래 남고,<br>취향은 더 넓어져요.",
      description:
        "좋아하는 책과 독서 감상을 나누는 공간. 책 추천, 서평, 댓글, 공감과 함께 나만의 책장을 만나보세요.",
    },
    en: {
      subtitle: "Good books. Better company.",
      eyebrow: "A LITTLE SHELF, A BIG WORLD",
      hero: "One good book.<br>A world of perspectives.",
      intro:
        "Share the books that stayed with you.<br>Your favorite could be someone’s next great read.",
      create: "Share a book",
      feed: "The community bookshelf",
      mine: "My book stories",
      saved: "My reading list",
      search: "Find a book, author, or review",
      titleLabel: "Book title",
      titlePlaceholder: "What have you been reading?",
      bodyLabel: "Why this book stayed with you",
      bodyPlaceholder:
        "Share a memorable moment, a new perspective, or who you would recommend this book to. (At least 20 characters)",
      emptyTitle: "Every bookshelf starts with one story.",
      emptyBody:
        "Share a favorite book and your own thoughts.<br>Real readers’ recommendations will appear here.",
      privacy:
        "I wrote this review and have permission to share the image. No full books or scanned copies.",
      promptTitle: "A little inspiration",
      prompts: [
        "A book you would give to a friend",
        "A story that stayed after the last page",
        "A book that changed your year",
      ],
      note: "Keep the good books.<br>Meet new perspectives.",
      description:
        "A shared shelf for books worth talking about. Share recommendations, thoughtful reviews, comments, and your next great read.",
    },
  },
  storage: "book-story:v1",
  relays: ["wss://nos.lol", "wss://relay.primal.net"],
  mediaUrls: ["https://nostrage.com/api/v2/media", "https://cdn.nostrcheck.me"],
};
