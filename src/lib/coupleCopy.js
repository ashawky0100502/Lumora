export function coupleCopy(lang) {
  const ar = lang === 'ar';
  return {
    brand: ar ? 'بورتال العروسين' : 'Couple Portal',
    entryKicker: ar ? 'دخول خاص' : 'Private Access',
    entryTitle: ar ? 'مساحتكم الخاصة' : 'Your Private Space',
    entrySub: ar
      ? 'هنا تقدروا تتابعوا تأكيدات الحضور وترودوا على رسائل وتعليقات ضيوفكم.'
      : "Track RSVPs and reply to your guests' messages and comments — just for the two of you.",
    codeLabel: ar ? 'كود الدخول' : 'Access code',
    codePlaceholder: ar ? 'ادخل الكود المكوّن من 6 أرقام' : 'Enter your 6-digit code',
    enter: ar ? 'دخول' : 'Enter',
    checking: ar ? 'جاري التحقق...' : 'Checking...',
    wrongCode: ar ? 'الكود غير صحيح، حاول مرة أخرى' : 'That code isn\u2019t right — please try again',
    notFound: ar ? 'لم نتمكن من العثور على هذه الدعوة' : 'We couldn\u2019t find this invitation',
    genericError: ar ? 'حصل خطأ، حاول تاني' : 'Something went wrong, please try again',

    gateKicker: ar ? 'دخول العروسين' : 'Couple Access',
    gateSub: ar ? 'مساحتكم الخاصة على وشك الفتح' : 'Your private space is about to open',
    gateOpenLabel: ar ? 'ادخلوا' : 'Enter',
    gateScratch: ar ? 'امسح الزهور للدخول' : 'Scratch the flowers to enter',
    gateScratchSkip: ar ? 'الدخول الآن' : 'Enter now',

    congratsKicker: ar ? 'ألف مبروك' : 'Congratulations',
    congratsLine1: ar ? 'رحلتكم المشتركة بدأت' : 'Your journey together begins',
    congratsLine2: ar
      ? 'من فريق LUMORA بالكامل، نتمنى لكم زواجًا مليئًا بالحب والسعادة.'
      : 'From all of us at LUMORA — wishing you a marriage full of love and joy.',
    congratsContinue: ar ? 'ادخلوا إلى بورتالكم' : 'Continue to your portal',

    welcomeBack: ar ? 'أهلاً بكم مجددًا' : 'Welcome back',
    signOut: ar ? 'تسجيل الخروج' : 'Sign out',

    nav: {
      overview: ar ? 'نظرة عامة' : 'Overview',
      rsvp: ar ? 'تأكيدات الحضور' : 'RSVPs',
      messages: ar ? 'الرسائل' : 'Messages',
      comments: ar ? 'دفتر الضيوف' : 'Guestbook',
    },

    overview: {
      title: ar ? 'أهلاً بكم في بورتالكم الخاص' : 'Welcome to your private portal',
      sub: ar ? 'ملخص سريع لكل حاجة بتحصل في دعوتكم' : 'A quick snapshot of everything happening on your invitation',
      totalResponses: ar ? 'إجمالي الردود' : 'Total responses',
      attending: ar ? 'هيحضروا' : 'Attending',
      notAttending: ar ? 'اعتذروا' : 'Not attending',
      totalGuests: ar ? 'إجمالي عدد الحضور' : 'Total guest count',
      unreadMessages: ar ? 'رسائل لم تُقرأ' : 'Unread messages',
      comments: ar ? 'تعليقات الضيوف' : 'Guest comments',
      daysToGo: ar ? 'يوم متبقي' : 'days to go',
      today: ar ? 'اليوم هو اليوم ✦' : 'Today is the day ✦',
      viewAll: ar ? 'عرض الكل' : 'View all',
    },

    rsvp: {
      title: ar ? 'من هيحضر؟' : 'Who\u2019s coming?',
      sub: ar ? 'كل تأكيدات الحضور اللي وصلتكم' : 'Every response your guests have sent',
      empty: ar ? 'لسه محدش رد على الدعوة' : 'No responses yet',
      loading: ar ? 'جاري التحميل...' : 'Loading...',
      filterAll: ar ? 'الكل' : 'All',
      filterAttending: ar ? 'هيحضروا' : 'Attending',
      filterNot: ar ? 'اعتذروا' : 'Not attending',
      guestsSuffix: ar ? 'أشخاص' : 'guests',
      searchPlaceholder: ar ? 'ابحث بالاسم...' : 'Search by name...',
    },

    messages: {
      title: ar ? 'رسائل الضيوف' : 'Guest messages',
      sub: ar ? 'ردّوا على ضيوفكم بشكل خاص' : 'Reply to your guests, one private thread at a time',
      empty: ar ? 'لسه محدش بعت رسالة' : 'No messages yet',
      loading: ar ? 'جاري التحميل...' : 'Loading...',
      selectThread: ar ? 'اختر محادثة لعرضها' : 'Select a conversation to view it',
      placeholder: ar ? 'اكتب ردكم...' : 'Type your reply...',
      send: ar ? 'إرسال' : 'Send',
      error: ar ? 'تعذّر إرسال الرد، حاول تاني' : 'Could not send the reply, please try again',
      guestFallback: ar ? 'ضيف' : 'Guest',
      you: ar ? 'أنتم' : 'You',
    },

    comments: {
      title: ar ? 'دفتر الضيوف' : 'Guestbook',
      sub: ar ? 'ردّوا على تهاني ضيوفكم علنًا' : 'Reply publicly to your guests\u2019 well-wishes',
      empty: ar ? 'لسه محدش كتب تعليق' : 'No comments yet',
      loading: ar ? 'جاري التحميل...' : 'Loading...',
      reply: ar ? 'رد' : 'Reply',
      replyPlaceholder: ar ? 'اكتبوا ردكم هنا...' : 'Write your reply...',
      send: ar ? 'نشر الرد' : 'Post reply',
      sending: ar ? 'جاري النشر...' : 'Posting...',
      yourReply: ar ? 'ردكم' : 'Your reply',
      loadMore: ar ? 'عرض المزيد' : 'Show more',
    },
  };
}
