/**
 * Bilingual "one-tap" suggestion banks — ported 1:1 from the original
 * Lumora build. Every suggest button in the wizard filters this content
 * by the couple's chosen invitation language before showing it.
 */

export const QURAN_SUGGESTIONS = [
  { lang: 'ar', text: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوٓا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ\n(سورة الروم: 21)' },
  { lang: 'ar', text: 'هُنَّ لِبَاسٌ لَّكُمْ وَأَنتُمْ لِبَاسٌ لَّهُنَّ\n(سورة البقرة: 187)' },
  { lang: 'ar', text: 'وَعَاشِرُوهُنَّ بِالْمَعْرُوفِ ۚ فَإِن كَرِهْتُمُوهُنَّ فَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَيَجْعَلَ اللَّهُ فِيهِ خَيْرًا كَثِيرًا\n(سورة النساء: 19)' },
  { lang: 'ar', text: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا\n(سورة الفرقان: 74)' },
  { lang: 'ar', text: 'وَجَعَلَ مِنْهَا زَوْجَهَا لِيَسْكُنَ إِلَيْهَا ۖ فَلَمَّا تَغَشَّاهَا حَمَلَتْ حَمْلًا خَفِيفًا فَمَرَّتْ بِهِ\n(سورة الأعراف: 189)' },
];

export const INVITATION_MESSAGE_SUGGESTIONS = [
  { lang: 'ar', text: 'يتشرف العروسان بدعوتكم لمشاركتهم أجمل لحظات حياتهم، ونتمنى نشوفكم معانا في يوم فرحنا.' },
  { lang: 'ar', text: 'بقلوب مليانة فرحة، يسعدنا ندعوكم لحضور حفل زفافنا، ووجودكم هيكمل فرحتنا.' },
  { lang: 'ar', text: 'نتشرف بدعوتكم لمشاركتنا بداية حياة جديدة، فوجودكم بجانبنا هو أجمل هدية في هذا اليوم.' },
  { lang: 'ar', text: 'يشرفنا حضوركم معنا في يوم يجمعنا فيه القدر على بداية قصة عمرنا، فكونوا معنا لنحتفل سوا.' },
  { lang: 'ar', text: 'مع أطيب الأمنيات، ندعوكم لتكونوا شهودًا على بداية رحلتنا معًا، ونتشرف بتواجدكم في هذا اليوم المميز.' },
  { lang: 'en', text: 'We joyfully invite you to celebrate the beginning of our new journey together — your presence would mean the world to us.' },
  { lang: 'en', text: 'With hearts full of joy, we would be honored to have you share this special day with us.' },
  { lang: 'en', text: 'Together with our families, we joyfully invite you to witness the beginning of our forever.' },
  { lang: 'en', text: "We can't imagine this day without the people we love most — please join us as we say 'I do'." },
  { lang: 'en', text: 'Request the pleasure of your company as we celebrate our wedding — a moment we would love to share with you.' },
];

export const STORY_SUGGESTIONS = [
  { lang: 'ar', text: 'من أول لحظة جمعتنا القدر، عرفنا إن الطريق طويل بس هيكون أحلى مع بعض. النهارده بندعوكم تشاركونا أول يوم في قصة حب هتفضل عمرنا كله.' },
  { lang: 'ar', text: 'حبنا بدأ بابتسامة وكبر مع كل يوم قضيناه مع بعض. دلوقتي جاي اليوم اللي هنقول فيه "نعم" قدام أغلى الناس، ونتمنى تكونوا معانا في أجمل لحظة في حياتنا.' },
  { lang: 'ar', text: 'مش كل قصص الحب بتبدأ بالصدفة، بس قصتنا إحنا بدأت كده وكبرت لحد ما بقت أجمل حاجة في حياتنا. يشرفنا حضوركم معانا نحتفل بيوم بداية رحلتنا الجديدة.' },
  { lang: 'en', text: "From the very first conversation, we knew something special had begun. Every day since has only made us more certain — and now we can't wait to start our forever, surrounded by the people we love most." },
  { lang: 'en', text: 'Two hearts, one story. What started as a simple hello grew into a love we never want to end. We would be honored to have you with us as we celebrate the beginning of our forever.' },
  { lang: 'en', text: 'They say when you know, you know. From that very first moment, we did. Join us as we celebrate the beginning of our forever, surrounded by the people who mean the world to us.' },
];

export const HOWWEMET_SUGGESTIONS = [
  { lang: 'ar', text: 'اتقابلنا أول مرة في مناسبة عائلية بسيطة، ومكنش حد فينا متخيل إن اللقاء ده هيغير حياتنا. كلمتين بسيطتين فتحوا باب حديث طويل، وبقينا نتكلم كل يوم لحد ما حسينا إننا لقينا نفسنا في بعض.' },
  { lang: 'ar', text: 'اتعرفنا عن طريق صديق مشترك، وكانت أول مرة بسيطة وعادية، بس كان فيها حاجة خلتنا نفضل نتكلم بعدها بكتير. ومن غير ما نحس، بقينا جزء أساسي من يوم بعض.' },
  { lang: 'ar', text: 'قابلنا بعض في الجامعة، بين المحاضرات وضحكات الأصحاب، ومن غير مقدمات كبيرة بدأت صداقة كبرت مع الوقت لحد ما بقت أعمق حاجة في حياتنا. ده أول فصل من حكايتنا، وباقي الفصول هتتكتب مع بعض.' },
  { lang: 'ar', text: 'قصتنا بدأت بالصدفة، في مكان مكناش متوقعين فيه حاجة، بس القدر كان له رأي تاني. من أول حوار بسيط لحد النهارده، وإحنا بنكبر مع بعض يوم ورا يوم.' },
  { lang: 'en', text: "We met by pure chance, in a moment neither of us expected. A simple conversation turned into hours of talking, and before we knew it, we couldn't imagine our days without each other." },
  { lang: 'en', text: "We were introduced by a mutual friend on an ordinary day that turned out to be anything but. What started as easy conversation slowly became the story of us — and we've been writing new chapters together ever since." },
  { lang: 'en', text: 'It all began in the most unplanned way — a shared class, a shared laugh, and a friendship that grew into something neither of us saw coming. Looking back, every small moment led us exactly here.' },
  { lang: 'en', text: 'Some love stories start with fireworks, ours started quietly — with a simple hello that we now consider the best decision of our lives. Every day since has only made us more sure of each other.' },
];

export const LETTER_GROOM_SUGGESTIONS = [
  { lang: 'ar', text: 'يا أغلى الناس، من يوم ما اتقابلنا وانتي بتضيفي لحياتي معنى تاني. مستنيك تكوني شريكتي في كل حاجة جاية، وشاكر ربنا إنه اختارك ليا. حبيبتي، النهارده وكل يوم بعده هيفضل ليكي.' },
  { lang: 'ar', text: 'مش هعرف أوصف حجم سعادتي وأنا واقف قدامك النهارده. انتي مش بس حبيبتي، انتي أمان قلبي وسر ابتسامتي. يارب دايمًا نكون مع بعض على كل حال.' },
  { lang: 'en', text: 'From the moment I met you, my whole world made more sense. Today I stand here more certain than ever that you are my person, my peace, and my forever. I promise to love you louder than my fears, every single day.' },
  { lang: 'en', text: "You are the best decision I never had to think twice about. Thank you for choosing me, for loving me, and for saying yes to forever. I can't wait to spend the rest of my life making you as happy as you make me." },
];

export const LETTER_BRIDE_SUGGESTIONS = [
  { lang: 'ar', text: 'حبيبي، مع إنك بسيط بس بتخليني حاسة إني أغلى وأهم واحدة في الدنيا. شكرًا إنك دايمًا جنبي، وشكرًا على كل يوم بتخليه أحلى. النهارده بقولها قدام الكل: بحبك وهفضل بحبك.' },
  { lang: 'ar', text: 'من غير ما أحس، بقيت أنت بيتي وسندي. مبسوطة إني هعيش باقي عمري جنبك، ومستنية نبني حياة مليانة حب واستقرار مع بعض. حبيبي، إنت أحلى حاجة حصلتلي.' },
  { lang: 'en', text: 'You have this quiet way of making everything feel okay just by being there. Today, in front of everyone we love, I promise you my heart, my patience, and my forever. Thank you for being exactly who you are.' },
  { lang: 'en', text: "I never believed in love at first sight until you walked into my life. Now I get to call you mine, forever. Thank you for your patience, your kindness, and for loving me so completely. Here's to our forever, my love." },
];

export const BIO_GROOM_SUGGESTIONS = [
  { lang: 'ar', text: 'شخص بسيط وطموح، بيحب العيلة والأصحاب، وبيؤمن إن أجمل حاجة في الدنيا هي إنك تلاقي حد يفهمك من غير ما تتكلم. شغوف بشغله وبيحب يطور نفسه، وقلبه دايمًا مليان امتنان للي حواليه.' },
  { lang: 'ar', text: 'واحد من الناس اللي بتحب الحياة بكل تفاصيلها البسيطة، بيحب السفر والقراءة وقعدة الأصحاب. شخصيته هادية بس فيها عزيمة قوية، ودايمًا بيحاول يكون سند لكل اللي حواليه.' },
  { lang: 'en', text: 'A simple, ambitious soul who values family and friendship above almost everything. Believes the best things in life are the quiet, shared moments, and always brings warmth and steadiness to everyone around him.' },
  { lang: 'en', text: "Someone who finds joy in life's small details — good conversations, new places, and quality time with the people he loves. Calm on the outside, determined on the inside, and endlessly grateful for those around him." },
];

export const BIO_BRIDE_SUGGESTIONS = [
  { lang: 'ar', text: 'بنت رقيقة وقوية في نفس الوقت، بتحب الفن والجمال في كل حاجة حواليها. شخصيتها مليانة حنية ودفء، وبتؤمن إن الحب الحقيقي هو اللي بيخليك تكون أحسن نسخة من نفسك.' },
  { lang: 'ar', text: 'واحدة من الناس اللي بتضيء المكان بابتسامتها، بتحب الضحك والسهر مع اللي بتحبهم. طموحة ومصممة على أهدافها، وفي نفس الوقت قلبها مليان حب لعيلتها وأصحابها.' },
  { lang: 'en', text: 'A gentle yet strong spirit who finds beauty in art, people, and everyday moments. Warm-hearted and deeply caring, she believes real love is what brings out the best version of you.' },
  { lang: 'en', text: 'Someone whose smile lights up every room she walks into. Ambitious and driven, yet always makes time for the people and moments that matter most to her heart.' },
];

export const ENGAGEMENT_SUGGESTIONS = [
  { lang: 'ar', text: 'يوم خطوبتنا كان بداية أول فصل رسمي من حكايتنا — فرحة العيلة، الدموع اللي مسكناها بصعوبة، وابتسامة ما فارقتش وشنا. من يومها ونحن بنعد الأيام لأجمل يوم في حياتنا.' },
  { lang: 'ar', text: 'فترة الخطوبة علمتنا نبني بيتنا سوا خطوة بخطوة، ونستمتع بكل تفصيلة صغيرة في رحلة التحضير لأكبر يوم في حياتنا. كل يوم كان بيقربنا لبعض أكتر.' },
  { lang: 'en', text: 'Our engagement day was the opening chapter of a story we still can\'t quite believe is real. Since then, every single day has brought us closer to the moment we get to say "I do."' },
  { lang: 'en', text: "The months since we got engaged have been filled with quiet joys and big dreams — planning a life together, one small decision at a time. We can't wait for you to be part of the next chapter." },
];

/** A curated one-tap starter menu, in case the couple doesn't want to type
 * every dish out by hand. */
export const SUGGESTED_MENU = [
  { category: 'Starters', name: 'Mixed Green Salad' },
  { category: 'Starters', name: 'Cream of Mushroom Soup' },
  { category: 'Starters', name: 'Stuffed Vine Leaves' },
  { category: 'Main Course', name: 'Grilled Beef Tenderloin' },
  { category: 'Main Course', name: 'Herb-Roasted Chicken' },
  { category: 'Main Course', name: 'Saffron Rice with Nuts' },
  { category: 'Main Course', name: 'Grilled Seasonal Vegetables' },
  { category: 'Dessert', name: 'Wedding Cake' },
  { category: 'Dessert', name: 'Assorted Petit Fours' },
  { category: 'Dessert', name: 'Fresh Fruit Platter' },
  { category: 'Drinks', name: 'Sparkling Juice Bar' },
  { category: 'Drinks', name: 'Arabic Coffee & Tea' },
];
