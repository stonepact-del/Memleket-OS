/** All values are SIMULATED GAME VALUE. This is a fictional life scenario,
 * not a representation of present or future Turkish eligibility, law or prices. */
export const TurkeyRuleset = {
  id: 'tr-fiction-2026-v1' as const,
  label: 'Kurgusal hayat senaryosu · tarihler, puanlar ve tutarlar oyun değeridir.',
  school: { endMonth: 5, endDay: 15, finalGrade: 12 },
  yks: { registrationMonth: 2, registrationDay: 1, examMonth: 5, examDay: 22, fee: 0 },
  retirement: { age: 60, minimumPension: 600000, maximumPension: 2400000 },
  allowance: 180000, studentGrant: 360000, studentLoan: 500000,
  livingCost: 240000, transportCost: 50000, savingsTransfer: 100000,
  debtLimit: 6000000, debtRepayment: 100000,
  housing: {
    family: { label:'Aileyle', rent:0, costs:0, quality:65, commute:32, deposit:0 },
    dorm: { label:'Yurt', rent:180000, costs:60000, quality:55, commute:12, deposit:180000 },
    roommate: { label:'Ev arkadaşıyla', rent:450000, costs:140000, quality:67, commute:20, deposit:450000 },
    rental: { label:'Kiralık ev', rent:900000, costs:220000, quality:82, commute:25, deposit:900000 },
  },
  programs: [
    {id:'software', name:'Koru Üniversitesi · Yazılım', field:'science', threshold:68, semesters:8, subjects:['Algoritmalar','Matematik','Veri yapıları','Proje atölyesi']},
    {id:'design', name:'Ufuk Üniversitesi · Tasarım', field:'social', threshold:55, semesters:8, subjects:['Görsel dil','Tasarım tarihi','Üretim atölyesi','Proje sunumu']},
    {id:'language', name:'Mavi Üniversite · Dil ve İletişim', field:'language', threshold:60, semesters:8, subjects:['Dilbilim','Çeviri','Yazılı anlatım','Kültür çalışmaları']},
    {id:'technical', name:'Kent Meslek Yüksekokulu · Teknik Uygulamalar', field:'tyt', threshold:42, semesters:4, subjects:['Temel teknik','İş güvenliği','Uygulama','Mesleki iletişim']},
  ],
};
export const routines = {
  balanced:{label:'Dengeli hafta', description:'Okul / iş, 1 saat tekrar, dinlenme ve yakınların.'},
  study:{label:'Eğitime odaklan', description:'Okul ve 3 saat tekrar; iş performansı ve sosyal zaman azalır.'},
  work:{label:'İşe odaklan', description:'Mesai ve mesleki gelişim; ders ve arkadaşlara daha az zaman.'},
  social:{label:'Yakınlarına zaman ayır', description:'Temel sorumluluklar, arkadaşlık ve aile; daha az tekrar.'},
  health:{label:'Yavaşla ve toparlan', description:'Hafif sorumluluklar, yürüyüş ve uyku; ilerleme daha yavaş.'},
  creative:{label:'Üret ve keşfet', description:'Temel sorumluluklar, yaratıcı proje ve yeni beceriler.'},
};
