/* =====================================================================
   EDIT HERE — everything the client will want to change lives in this block

   Folders
   assets/brand/   logos, paths from the page (assets/brand/ford.svg).
   assets/work/    before/after photos, one folder per project id.
   js/content.js   brands, colors, projects, and gallery shots.
   js/i18n.js      English strings. Work photos are .webp files in assets/work (same name, no old extension).
   js/util.js      shared helpers. js/hero.js, js/works.js, js/viewer.js, js/studio.js, js/boot.js are behavior.
   ===================================================================== */
const WHATSAPP = "20100000000";            // رقم واتساب بالصيغة الدولية بدون + (مثال: 201001234567)

const SOCIAL = [                            // ضع رابط كل حساب. احذف السطر لإخفاء الأيقونة.
  {label:'تيك توك',  icon:'i-tt',    url:'https://www.tiktok.com/@solarpro.sa'},
  {label:'سناب شات', icon:'i-snap',  url:'https://www.snapchat.com/@solarpro.sa'},
  {label:'إنستغرام', icon:'i-insta', url:'https://www.instagram.com/solarpro.sa/'},
  {label:'إكس',      icon:'i-x',     url:'https://x.com/solarpro_sa'},
  {label:'فيسبوك',   icon:'i-fb',    url:'https://www.facebook.com/solarpro.sa'},
];

const BRANDS = [                            // الماركات — أضف ماركة: {id, name, logo:'path/to/logo.svg'}
  {id:'ford', name:'فورد', logo:'assets/brand/ford.svg'},
  {id:'landrover', name:'لاند روفر', logo:'assets/brand/defender.svg'},
  {id:'cadillac', name:'كاديلاك', logo:'assets/brand/cadillac.svg'},
  {id:'lexus', name:'لكزس', logo:'assets/brand/Lexus-Logo.svg', mark:'lexus'},
];

const PARTS = [                             // الجزء الذي تم تنجيده
  {id:'seats',    name:'المقاعد'},
  {id:'headrest', name:'مساند الرأس'},
  {id:'doors',    name:'لوحات الأبواب'},
  {id:'console',  name:'الكونسول ومسند الذراع'},
  {id:'roof',     name:'السقف'},
  {id:'wheel',    name:'عجلة القيادة'},
  {id:'cabin',    name:'المقصورة كاملة'},
];

const PATTERNS = [
  {name:'ألماس',  icon:'i-diamond'},
  {name:'سادة',   icon:'i-plain'},
  {name:'مربعات', icon:'i-squares'},
];

const COLORS = [
  {id:'black',    name:'أسود',        hex:'#1c1c1f'},
  {id:'charcoal', name:'رمادي فحمي',  hex:'#555a63'},
  {id:'navy',     name:'كحلي',        hex:'#27406b'},
  {id:'olive',    name:'زيتي',        hex:'#51633f'},
  {id:'brown',    name:'بني',         hex:'#68412a'},
  {id:'cognac',   name:'عسلي',        hex:'#b86a2a'},
  {id:'sand',     name:'بيج',         hex:'#d2bc99'},
  {id:'ivory',    name:'عاجي',        hex:'#efe6d3'},
  {id:'red',      name:'أحمر',        hex:'#c4161c'},
];
const CARD_COLORS = [                      // ألوان تظهر على بطاقة العمل فقط
  {id:'baby', name:'أزرق فاتح', hex:'#7ec8e3'},
];

const FINISHES = [
  {id:'matte',  name:'مطفي',  note:'هادئ'},
  {id:'smooth', name:'ناعم',  note:'متوازن'},
  {id:'glossy', name:'لامع',  note:'لمعة واضحة'},
];

const PRESETS = [                           // تصاميم جاهزة في ورشة التصميم
  {name:'كلاسيك', pattern:0, body:'black',    insert:'cognac', finish:'smooth'},
  {name:'سبورت',  pattern:2, body:'black',    insert:'red',    finish:'matte'},
  {name:'فاخر',   pattern:0, body:'brown',    insert:'ivory',  finish:'smooth'},
  {name:'عصري',   pattern:1, body:'charcoal', insert:'sand',   finish:'glossy'},
];

/* المشاريع: كل سيارة مشروع، ولها عدة زوايا (JOBS) قبل/بعد.
   brand: معرّف الماركة من BRANDS · car: الموديل · story: وصف قصير للمشروع (اختياري) · year: اختياري */
const shot = p => encodeURI(p.replace(/\.(png|jpe?g|webp)$/i, '') + '.webp');
const PROJECTS = [
  {id:'ford-mustang', brand:'ford', car:'موستنج',
   story:'انتقلت المقصورة من جلد أسود مع بيج متعب إلى جلد أحمر كامل على المقاعد ومساند الرأس، مع تغليف جديد لعجلة القيادة بخياطة حمراء.'},
  {id:'defender', brand:'landrover', car:'ديفندر',
   story:'تنجيد المقصورة بجلد أزرق فاتح على المقاعد والأبواب وعجلة القيادة، مع وسط مخرّم وخياطة متباينة.'},
  {id:'cadillac-ct6', brand:'cadillac', car:'CT6',
   story:'تنجيد عاجي للمقاعد الأمامية والخلفية، مع لوحة باب بجلد كحلي وعاجي، وتغليف عجلة القيادة بجلد عاجي.'},
  {id:'lexus-lx', brand:'lexus', car:'LX',
   story:'تنجيد مقصورة لكزس LX: المقاعد الخلفية، المقصورة الأمامية والخلفية، ولوحة الباب.'},
];

/* الزوايا قبل/بعد. project: معرّف المشروع · part: الجزء · title: اسم الزاوية
   before / after: صورتا قبل وبعد · focus: نقطة التركيز عند القص (مثال '50% 40%')
   note: ما تم عمله · color + pattern: اختياريان لزر "جرّب هذا اللون في الاستوديو" */
const JOBS = [
  {project:'ford-mustang', part:'seats',    title:'المقاعد الأمامية', focus:'50% 50%', color:'red', pattern:1,
   before:shot('assets/work/ford-mustang/Front Seats/Ford-Mustang-Front-Seats-Before'),
   after:shot('assets/work/ford-mustang/Front Seats/Ford-Mustang-Front-Seats-After'),
   note:'استبدال الأسود والبيج بجلد أحمر كامل، مع وسط مخرّم وخياطة متناسقة.'},
  {project:'ford-mustang', part:'seats',    title:'مقعد السائق', focus:'50% 55%', color:'red', pattern:1,
   before:shot('assets/work/ford-mustang/driver seat/Ford-Mustang-Driver-Seat-Before'),
   after:shot('assets/work/ford-mustang/driver seat/Ford-Mustang-Driver-Seat-After'),
   note:'إعادة تنجيد كاملة بعد تلف الجلد وظهور الإسفنج.'},
  {project:'ford-mustang', part:'headrest', title:'مسند الرأس', focus:'50% 38%', color:'red', pattern:1,
   before:shot('assets/work/ford-mustang/Headrest/Ford-Mustang-Headrest-Before'),
   after:shot('assets/work/ford-mustang/Headrest/Ford-Mustang-Headrest-after'),
   note:'مسند رأس جديد بجلد أحمر وخياطة دقيقة بدل الجلد المتشقق.'},
  {project:'ford-mustang', part:'wheel',    title:'عجلة القيادة', focus:'50% 46%',
   before:shot('assets/work/ford-mustang/wheel/Ford-Mustang-Steering-Wheel-Before'),
   after:shot('assets/work/ford-mustang/wheel/Ford-Mustang-Steering-Wheel-After'),
   note:'تغليف جديد بجلد أسود مع خياطة حمراء متناسقة مع المقاعد.'},
  {project:'ford-mustang', part:'seats', title:'المقاعد الخلفية', color:'red', pattern:1,
   before:shot('assets/work/ford-mustang/Rear Seats/Ford-Mustang-Rear-Seats-Before'),
   after:shot('assets/work/ford-mustang/Rear Seats/Ford-Mustang-Rear-Seats-After'),
   note:'تنجيد المقاعد الخلفية بجلد أحمر مع وسط مخرّم وخياطة متناسقة مع الأمام.'},
  {project:'defender', part:'cabin', title:'المقصورة الأمامية', color:'baby',
   before:shot('assets/work/defender/Interior Front/Land-Rover-Defender-Interior-Front-Before'),
   after:shot('assets/work/defender/Interior Front/Land-Rover-Defender-Interior-Front-After'),
   note:'تنجيد المقصورة الأمامية بجلد أزرق فاتح على المقعد والمقود ولوحة القيادة.'},
  {project:'defender', part:'cabin', title:'جهة الراكب', color:'baby',
   before:shot('assets/work/defender/Passenger Side/Defender-Passenger-Side-Before'),
   after:shot('assets/work/defender/Passenger Side/Defender-Passenger-Side-After'),
   note:'مقعد الراكب ولوحة القيادة بجلد أزرق فاتح مع وسط مخرّم.'},
  {project:'defender', part:'doors', title:'لوحة الباب', color:'baby',
   before:shot('assets/work/defender/Door Panel/Land-Rover-Defender-Door-Panel-Before'),
   after:shot('assets/work/defender/Door Panel/Land-Rover-Defender-Door-Panel-After'),
   note:'كسوة علوية ومسند ذراع للباب بجلد أزرق فاتح.'},
  {project:'defender', part:'seats', title:'المقاعد الخلفية', color:'baby',
   before:shot('assets/work/defender/Rear seats/Rear Seats – Before'),
   after:shot('assets/work/defender/Rear seats/Rear Seats – After'),
   note:'تنجيد المقاعد الخلفية بجلد أزرق فاتح مع وسط مخرّم ومساند رأس متناسقة.'},
  {project:'defender', part:'cabin', title:'المقصورة الخلفية', color:'baby',
   before:shot('assets/work/defender/rear cabin/Rear Cabin – Before'),
   after:shot('assets/work/defender/rear cabin/Rear Cabin – After'),
   note:'ظهر المقاعد الأمامية والمقاعد الخلفية بجلد أزرق فاتح.'},
  {project:'defender', part:'cabin', title:'مقصورة السائق', color:'baby',
   before:shot('assets/work/defender/Driver Cockpit/Land-Rover-Defender-Driver-Side-Interior-Before'),
   after:shot('assets/work/defender/Driver Cockpit/Land-Rover-Defender-Driver-Side-Interior-After'),
   note:'تنجيد مقصورة السائق بجلد أزرق فاتح على المقعد ولوحة القيادة والمقود.'},
  {project:'cadillac-ct6', part:'seats', title:'المقاعد الأمامية', color:'ivory',
   before:shot('assets/work/cadillac-ct6/Front Seats/Cadillac-CT6-Front-Seats-Before'),
   after:shot('assets/work/cadillac-ct6/Front Seats/Cadillac-CT6-Front-Seats-After'),
   note:'تنجيد المقاعد الأمامية بجلد عاجي مع وسط مخرّم وخياطة دقيقة.'},
  {project:'cadillac-ct6', part:'seats', title:'المقاعد الخلفية', color:'ivory',
   before:shot('assets/work/cadillac-ct6/Rear Seats/Cadillac-CT6-Rear-Seats-Before'),
   after:shot('assets/work/cadillac-ct6/Rear Seats/Cadillac-CT6-Rear-Seats-After'),
   note:'تنجيد المقاعد الخلفية بجلد عاجي متناسق مع المقاعد الأمامية.'},
  {project:'cadillac-ct6', part:'cabin', title:'المقصورة', color:'ivory',
   before:shot('assets/work/cadillac-ct6/Interior/Cadillac-CT6-Interior-Before'),
   after:shot('assets/work/cadillac-ct6/Interior/Cadillac-CT6-Interior-After'),
   note:'ظهر المقاعد الأمامية بجلد عاجي مع جيوب ومساند رأس متناسقة.'},
  {project:'cadillac-ct6', part:'doors', title:'لوحة الباب',
   before:shot('assets/work/cadillac-ct6/Door Panel/Cadillac-CT6-Door-Panel-Before'),
   after:shot('assets/work/cadillac-ct6/Door Panel/Cadillac-CT6-Door-Panel-After'),
   note:'لوحة الباب بجلد كحلي في الأعلى وعاجي في الأسفل مع خياطة فاتحة.'},
  {project:'cadillac-ct6', part:'wheel', title:'عجلة القيادة', color:'ivory',
   before:shot('assets/work/cadillac-ct6/Wheel/Cadillac-CT6-Steering-Wheel-Before'),
   after:shot('assets/work/cadillac-ct6/Wheel/Cadillac-CT6-Steering-Wheel-After'),
   note:'تغليف المقود بجلد عاجي مع خياطة فاتحة على الحافة.'},
  {project:'lexus-lx', part:'cabin', title:'المقصورة الأمامية',
   before:shot('assets/work/lexus-lx/Interior Front/Lexus-Front-Interior-Before'),
   after:shot('assets/work/lexus-lx/Interior Front/Lexus-Front-Interior-After'),
   note:'تنجيد المقصورة الأمامية.'},
  {project:'lexus-lx', part:'doors', title:'لوحة الباب',
   before:shot('assets/work/lexus-lx/Door Panel/Lexus-Door-Panel-Before'),
   after:shot('assets/work/lexus-lx/Door Panel/Lexus-Door-Panel-After'),
   note:'تنجيد لوحة الباب بجلد متناسق مع المقصورة.'},
  {project:'lexus-lx', part:'seats', title:'المقاعد الخلفية',
   before:shot('assets/work/lexus-lx/Rear seats/Lexus-LX-Rear-Seats-Before'),
   after:shot('assets/work/lexus-lx/Rear seats/Lexus-LX-Rear-Seats-After'),
   note:'تنجيد المقاعد الخلفية مع مساند رأس متناسقة.'},
  {project:'lexus-lx', part:'cabin', title:'المقصورة الخلفية',
   before:shot('assets/work/lexus-lx/rear cabin/Lexus-LX-Rear-Cabin-Before'),
   after:shot('assets/work/lexus-lx/rear cabin/Lexus-LX-Rear-Cabin-After'),
   note:'تنجيد المقصورة الخلفية بجلد متناسق مع المقاعد.'},
];
/* =====================================================================
   STUDIO — interior configurator (steps like a car builder, one screen)
   ===================================================================== */
const ICOL = [                              // ألوان الجلد
  {id:'red',      name:'أحمر',       hex:'#cf443c'},
  {id:'black',    name:'أسود',       hex:'#1c1c1f'},
  {id:'charcoal', name:'رمادي فحمي', hex:'#4d525a'},
  {id:'navy',     name:'كحلي',       hex:'#27406b'},
  {id:'olive',    name:'زيتي',       hex:'#51633f'},
  {id:'brown',    name:'بني',        hex:'#68412a'},
  {id:'cognac',   name:'عسلي',       hex:'#b86a2a'},
  {id:'sand',     name:'بيج',        hex:'#d2bc99'},
  {id:'ivory',    name:'عاجي',       hex:'#efe6d3'},
  {id:'burgundy', name:'نبيذي',      hex:'#6e1a26'},
];
const PAL = {
  leather: ICOL,
  wheel: [
    {id:'black',    name:'أسود',       hex:'#2a2a2c'}, ...ICOL.filter(c => !['black','red'].includes(c.id)), {id:'red', name:'أحمر', hex:'#b3202a'},
  ],
  thread: [
    {id:'red',    name:'أحمر',    hex:'#b3333a'},
    {id:'black',  name:'أسود',    hex:'#161616'},
    {id:'white',  name:'أبيض',    hex:'#f3f3f1'},
    {id:'ivory',  name:'عاجي',    hex:'#e8dcc0'},
    {id:'gold',   name:'ذهبي',    hex:'#d4a63a'},
    {id:'orange', name:'برتقالي', hex:'#e8721c'},
    {id:'blue',   name:'أزرق',    hex:'#2f6bd1'},
    {id:'gray',   name:'رمادي',   hex:'#8a8d93'},
  ],
  roof: [
    {id:'charcoal', name:'رمادي داكن', hex:'#4a403d'},
    {id:'black',    name:'أسود',       hex:'#1b1b1e'},
    {id:'sand',     name:'بيج',        hex:'#cdb99a'},
    {id:'ivory',    name:'عاجي',       hex:'#e8e0cf'},
    {id:'silver',   name:'رمادي فاتح', hex:'#a9a9ad'},
    {id:'brown',    name:'بني',        hex:'#6e5a4a'},
    {id:'navy',     name:'كحلي',       hex:'#2b3550'},
    {id:'burgundy', name:'نبيذي',      hex:'#5a2430'},
  ],
};
const DESC = {
  red:'أحمر نابض كما في موستنج التي أنجزناها. يمنح المقصورة طابعًا رياضيًا واضحًا.',
  black:'أسود عميق يمنح المقصورة هدوءًا وفخامة، ويناسب الاستخدام اليومي.',
  charcoal:'رمادي فحمي متوازن، أخفّ من الأسود وأكثر حيادية.',
  navy:'كحلي داكن بطابع رسمي هادئ، يظهر لونه بوضوح في الضوء الطبيعي.',
  olive:'زيتي ترابي مميّز يعطي المقصورة طابعًا جريئًا وغير مألوف.',
  brown:'بني غني يقرّب المقصورة من الطابع الكلاسيكي الدافئ.',
  cognac:'عسلي دافئ يلمع تحت الضوء، من أشهر ألوان الجلد الفاخر.',
  sand:'بيج رملي هادئ يفتح المقصورة ويمنحها إحساسًا بالاتساع.',
  ivory:'عاجي ناعم يرفع إضاءة المقصورة، ويحتاج عناية أكثر من الألوان الداكنة.',
  burgundy:'نبيذي عميق يجمع بين الجرأة والفخامة.',
  white:'أبيض نظيف يبرز خطوط الخياطة بوضوح.',
  gold:'ذهبي يضيف لمسة فخامة دقيقة على الحواف.',
  orange:'برتقالي حيوي يخلق تباينًا جريئًا مع الجلد الداكن.',
  blue:'أزرق رياضي يلفت النظر إلى تفاصيل الخياطة.',
  gray:'رمادي هادئ يعطي خياطة متناسقة دون تباين حاد.',
  silver:'رمادي فاتح يجعل السقف أخفّ ويزيد إحساس الاتساع.',
};
/* hot: [أفقي, رأسي] موضع النقطة على صورة المقعد، نسب مئوية.
   view 'A' = المقصورة ، view 'B' = المقود. */
const STEP_ICONS = {
  seats:  'assets/brand/car-interior-icons/seats.svg',
  heads:  'assets/brand/car-interior-icons/headrests.svg',
  doors:  'assets/brand/car-interior-icons/door-panels.svg',
  arm:    'assets/brand/car-interior-icons/armrest-console.svg',
  roof:   'assets/brand/car-interior-icons/headliner.svg',
  wheel:  'assets/brand/car-interior-icons/steering-wheel.svg',
  thread: 'assets/brand/car-interior-icons/stitching.svg'
};
const STEPS = [
  {id:'seats', name:'المقاعد',                  parts:['A:seats','B:seatB'], view:'A', pal:'leather', def:'red',      hot:[46,82]},
  {id:'heads', name:'مساند الرأس',              parts:['A:heads'],           view:'A', pal:'leather', def:'match',    hot:[70,14], match:true},
  {id:'doors', name:'لوحات الأبواب',            parts:['A:doors'],           view:'A', pal:'leather', def:'match',    hot:[28,36], match:true},
  {id:'arm',   name:'مسند الذراع والكونسول',    parts:['A:arm'],             view:'A', pal:'leather', def:'match',    hot:[36,55], match:true},
  {id:'roof',  name:'سقف السيارة',              parts:['A:roof'],            view:'A', pal:'roof',    def:'charcoal', hot:[34,18]},
  {id:'wheel', name:'عجلة القيادة',             parts:['B:wheel'],           view:'B', pal:'wheel',   def:'black',    hot:[54,52]},
  {id:'thread',name:'الخياطة',                  parts:['B:thread'],          view:'B', pal:'thread',  def:'red',      hot:[80,66]},
];
const SUMMARY = STEPS.length;               // آخر خطوة = الملخص
const PRICES = {};                          // اختياري: {'seats:cognac': 1500} → يظهر السعر أعلى اللوحة
const CURRENCY = 'ر.س';
const GM = 205;                             // متوسط تدرج الصور المحايدة
const PRESETS_I = [
  {name:'كلاسيك', c:{seats:'cognac',  heads:'match', doors:'match', arm:'match', roof:'sand',     wheel:'brown', thread:'ivory'}},
  {name:'سبورت',  c:{seats:'black',   heads:'red',   doors:'red',   arm:'red',   roof:'black',    wheel:'black', thread:'red'}},
  {name:'فاخر',   c:{seats:'ivory',   heads:'match', doors:'brown', arm:'brown', roof:'sand',     wheel:'brown', thread:'gold'}},
  {name:'عصري',   c:{seats:'charcoal',heads:'match', doors:'match', arm:'match', roof:'charcoal', wheel:'black', thread:'white'}},
];
/* ===================================================================== */
