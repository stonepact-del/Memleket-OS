import type { Decision } from '../core/lifeModel';
import type { LifeEffect } from '../core/lifeModel';

export type NarrativeStage='school'|'preparing'|'university'|'vocational'|'working'|'retired';
export type NarrativeActor='family'|'friend'|'classmate'|'roommate'|'coworker'|'manager'|'any';
export interface NarrativeOptionDefinition { id:string; label:string; description:string; timeMinutes?:number; moneyCost?:number; effects:{kind:'interaction'|'narrative';target:string;value?:number;interaction?:NonNullable<LifeEffect['interaction']>}[] }
export interface NarrativeEventDefinition {
  id:string; category:string; source:Decision['source']; title:string; text:string; stages:NarrativeStage[]; actor:NarrativeActor;
  weight:number; cooldownDays:number; blocking:boolean; oneShot?:boolean; options:NarrativeOptionDefinition[];
}

// These are authored situations, not generated copy. The director supplies the
// actual person and only selects from definitions appropriate to the life phase.
export const narrativeEvents:NarrativeEventDefinition[]=[
  {id:'classmate-notes',category:'Lise',source:'chat',title:'Not defteri masanda kaldı',text:'{actor}, dünkü notlarının fotoğrafını istiyor. Kendi sınavı da yaklaşıyor.',stages:['school'],actor:'classmate',weight:8,cooldownDays:35,blocking:true,options:[
    {id:'share',label:'Notları gönder',description:'Akşamından biraz zaman ayırırsın.',timeMinutes:35,effects:[{kind:'interaction',target:'$actor',value:7,interaction:'supported'},{kind:'narrative',target:'chain:start:classmate-support:18'}]},
    {id:'explain',label:'Kısa bir sesli anlatım yap',description:'Kendi tekrarını da pekiştirirsin.',timeMinutes:55,effects:[{kind:'interaction',target:'$actor',value:5,interaction:'helped'},{kind:'narrative',target:'knowledge:Matematik:2'}]},
    {id:'decline',label:'Bu kez yetişemeyeceğini söyle',description:'Bu akşam planını korursun.',effects:[{kind:'interaction',target:'$actor',value:-4,interaction:'declinedInvitation'}]}
  ]},
  {id:'teacher-conversation',category:'Lise',source:'school',title:'Öğretmenin konuşmak istiyor',text:'Ders çıkışında öğretmenin, son haftalardaki dalgınlığını fark ettiğini söylüyor.',stages:['school'],actor:'any',weight:6,cooldownDays:50,blocking:true,options:[
    {id:'open',label:'Açıkça konuş',description:'Rehberlik saatine kalırsın.',timeMinutes:30,effects:[{kind:'narrative',target:'stress:-8'},{kind:'narrative',target:'mood:4'}]},
    {id:'plan',label:'Çalışma planı iste',description:'Bir sonraki hafta için net bir çerçeve alırsın.',timeMinutes:25,effects:[{kind:'narrative',target:'knowledge:Matematik:2'},{kind:'narrative',target:'chain:start:teacher-plan:14'}]},
    {id:'pass',label:'İyi olduğumu söyle',description:'Konuşmayı uzatmazsın.',effects:[{kind:'narrative',target:'stress:3'}]}
  ]},
  {id:'club-responsibility',category:'Lise',source:'school',title:'Kulüp panosunda boş bir yer var',text:'Okuldaki küçük bir etkinlik için düzenleme desteği aranıyor. Aynı hafta sınavların da var.',stages:['school'],actor:'friend',weight:5,cooldownDays:70,blocking:false,options:[
    {id:'join',label:'Sorumluluğu al',description:'İki akşamını ayırırsın.',timeMinutes:120,effects:[{kind:'interaction',target:'$actor',value:4,interaction:'sharedTime'},{kind:'narrative',target:'mood:5'}]},
    {id:'small',label:'Sadece duyuruyu hazırla',description:'Kısa bir katkı yaparsın.',timeMinutes:35,effects:[{kind:'narrative',target:'mood:2'}]},
    {id:'skip',label:'Bu dönem katılma',description:'Ders programın değişmez.',effects:[{kind:'interaction',target:'$actor',value:-1,interaction:'declinedInvitation'}]}
  ]},
  {id:'yks-fatigue',category:'YKS',source:'school',title:'Deneme sonrası sessizlik',text:'Deneme çıkışında {actor}, sonucun yüzünden okunuyor diye yanına geliyor.',stages:['preparing'],actor:'friend',weight:9,cooldownDays:28,blocking:true,options:[
    {id:'walk',label:'Kısa bir yürüyüşe çık',description:'Bir saatini dinlenmeye ayırırsın.',timeMinutes:60,effects:[{kind:'interaction',target:'$actor',value:6,interaction:'sharedTime'},{kind:'narrative',target:'stress:-10'}]},
    {id:'review',label:'Yanlışları birlikte incele',description:'Akşamını denemeye ayırırsın.',timeMinutes:90,effects:[{kind:'interaction',target:'$actor',value:4,interaction:'helped'},{kind:'narrative',target:'knowledge:Matematik:3'}]},
    {id:'alone',label:'Tek başına kalmak iste',description:'Şimdilik konuşmayı ertelersin.',effects:[{kind:'interaction',target:'$actor',value:-2,interaction:'disappointed'}]}
  ]},
  {id:'yks-family-path',category:'YKS',source:'chat',title:'Akşam masasında gelecek konuşuluyor',text:'Evde herkes farklı bir yol öneriyor. {actor}, önce senin ne istediğini soruyor.',stages:['preparing'],actor:'family',weight:7,cooldownDays:60,blocking:true,options:[
    {id:'say',label:'Kendi planını anlat',description:'Konuşmayı uzatır ama belirsizliği azaltır.',timeMinutes:40,effects:[{kind:'interaction',target:'$actor',value:5,interaction:'repairedTrust'},{kind:'narrative',target:'confidence:4'}]},
    {id:'listen',label:'Önce onları dinle',description:'Bu akşam karar vermek zorunda değilsin.',timeMinutes:30,effects:[{kind:'interaction',target:'$actor',value:2,interaction:'sharedTime'}]},
    {id:'leave',label:'Konuyu kapat',description:'Sınav öncesi alanını korursun.',effects:[{kind:'interaction',target:'$actor',value:-3,interaction:'disagreement'},{kind:'narrative',target:'stress:4'}]}
  ]},
  {id:'dorm-kitchen',category:'Üniversite',source:'chat',title:'Mutfakta bekleyen not',text:'{actor}, ortak alan düzeni yüzünden yorulduğunu yazmış. Bu akşam konuşmak istiyor.',stages:['university'],actor:'roommate',weight:8,cooldownDays:45,blocking:true,options:[
    {id:'talk',label:'Oturup bir düzen kur',description:'Bir saatini ayırırsın.',timeMinutes:60,effects:[{kind:'interaction',target:'$actor',value:7,interaction:'conflictResolved'},{kind:'narrative',target:'chain:start:roommate-repair:21'}]},
    {id:'apologize',label:'Özür dileyip kendi payını al',description:'Kısa ama net bir konuşma yaparsın.',timeMinutes:25,effects:[{kind:'interaction',target:'$actor',value:4,interaction:'apologized'}]},
    {id:'ignore',label:'Mesaja şimdilik dönme',description:'Teslimini yetiştirmeye çalışırsın.',effects:[{kind:'interaction',target:'$actor',value:-6,interaction:'disappointed'}]}
  ]},
  {id:'group-project',category:'Üniversite',source:'school',title:'Grup projesi dağılmak üzere',text:'{actor}, herkesin farklı saatte boş olduğunu söylüyor. Teslim tarihi yakında.',stages:['university'],actor:'classmate',weight:9,cooldownDays:35,blocking:true,options:[
    {id:'lead',label:'Toplantıyı sen toparla',description:'Bu akşam iki saatini verirsin.',timeMinutes:120,effects:[{kind:'interaction',target:'$actor',value:5,interaction:'helped'},{kind:'narrative',target:'confidence:3'}]},
    {id:'part',label:'Kendi kısmını erkenden bitir',description:'Bir saatini ayırırsın.',timeMinutes:60,effects:[{kind:'narrative',target:'knowledge:Matematik:2'}]},
    {id:'ask',label:'Hocadan kısa ek süre iste',description:'Sonuç kesin değil; konuşmayı başlatırsın.',timeMinutes:20,effects:[{kind:'interaction',target:'$actor',value:-1,interaction:'disagreement'}]}
  ]},
  {id:'internship-opening',category:'Üniversite',source:'career',title:'Küçük bir staj duyurusu',text:'Bölüm grubunda kısa süreli bir uygulama fırsatı paylaşılıyor. Ders haftasıyla çakışabilir.',stages:['university'],actor:'friend',weight:6,cooldownDays:75,blocking:true,options:[
    {id:'apply',label:'Başvuruyu hazırla',description:'Bir akşamını ayırırsın.',timeMinutes:100,effects:[{kind:'narrative',target:'experience:10'},{kind:'narrative',target:'chain:start:internship-opening:30'}]},
    {id:'ask',label:'Önce deneyim yaşayanlara sor',description:'Kısa bir görüşme yaparsın.',timeMinutes:30,effects:[{kind:'interaction',target:'$actor',value:3,interaction:'supported'}]},
    {id:'wait',label:'Bu dönemi pas geç',description:'Ders düzenini korursun.',effects:[{kind:'narrative',target:'stress:-2'}]}
  ]},
  {id:'mentor-practice',category:'Meslek',source:'career',title:'Ustadan gelen teklif',text:'Atölyedeki {actor}, hafta sonu ek uygulama yapmayı öneriyor.',stages:['vocational'],actor:'coworker',weight:7,cooldownDays:45,blocking:true,options:[
    {id:'go',label:'Uygulamaya katıl',description:'Dört saatini ayırırsın.',timeMinutes:240,effects:[{kind:'interaction',target:'$actor',value:6,interaction:'helped'},{kind:'narrative',target:'experience:3'}]},
    {id:'observe',label:'Bir saat uğrayıp izle',description:'Kısa bir gözlem yaparsın.',timeMinutes:60,effects:[{kind:'interaction',target:'$actor',value:2,interaction:'sharedTime'}]},
    {id:'decline',label:'Bu hafta dinlen',description:'Enerjini korursun.',effects:[{kind:'interaction',target:'$actor',value:-2,interaction:'declinedInvitation'},{kind:'narrative',target:'energy:5'}]}
  ]},
  {id:'coworker-mistake',category:'Kariyer',source:'career',title:'Bir dosyada küçük bir hata var',text:'{actor}, vardiya bitmeden önce fark edilen hatanın sorumluluğunu nasıl paylaşacağınızı soruyor.',stages:['working'],actor:'coworker',weight:9,cooldownDays:38,blocking:true,options:[
    {id:'fix',label:'Birlikte düzelt',description:'Kırk beş dakika daha kalırsın.',timeMinutes:45,effects:[{kind:'interaction',target:'$actor',value:6,interaction:'helped'},{kind:'narrative',target:'performance:3'}]},
    {id:'own',label:'Kendi payını açıkça söyle',description:'Kısa bir görüşme yaparsın.',timeMinutes:20,effects:[{kind:'interaction',target:'$actor',value:3,interaction:'repairedTrust'}]},
    {id:'leave',label:'Kendi kısmını bitirip çık',description:'İşi sabaha bırakırsın.',effects:[{kind:'interaction',target:'$actor',value:-6,interaction:'disappointed'},{kind:'narrative',target:'performance:-3'}]}
  ]},
  {id:'manager-lead',category:'Kariyer',source:'career',title:'Yöneticin küçük bir işi sana bırakmak istiyor',text:'{actor}, gelecek haftaki teslim için koordinasyonu üstlenip üstlenmeyeceğini soruyor.',stages:['working'],actor:'manager',weight:8,cooldownDays:65,blocking:true,options:[
    {id:'accept',label:'Sorumluluğu kabul et',description:'Gelecek hafta programın daha yoğun olur.',timeMinutes:30,effects:[{kind:'interaction',target:'$actor',value:5,interaction:'helped'},{kind:'narrative',target:'chain:start:manager-lead:21'},{kind:'narrative',target:'stress:5'}]},
    {id:'scope',label:'Daha dar bir görev öner',description:'Sınırlarını netleştirirsin.',timeMinutes:20,effects:[{kind:'interaction',target:'$actor',value:2,interaction:'repairedTrust'}]},
    {id:'decline',label:'Bu kez kabul etme',description:'Mevcut iş yükünü korursun.',effects:[{kind:'interaction',target:'$actor',value:-2,interaction:'declinedInvitation'}]}
  ]},
  {id:'rent-repair',category:'Yetişkinlik',source:'bank',title:'Evde beklenmedik bir masraf çıktı',text:'Mutfaktaki küçük arıza için bu hafta bir ödeme gerekiyor.',stages:['working'],actor:'family',weight:6,cooldownDays:70,blocking:true,options:[
    {id:'pay',label:'Hemen yaptır',description:'Bilinen masraf: 1.200 TL.',moneyCost:120000,effects:[{kind:'narrative',target:'stress:-3'}]},
    {id:'share',label:'Yakınından destek iste',description:'Konuşmayı bugün yaparsın.',timeMinutes:25,effects:[{kind:'interaction',target:'$actor',value:3,interaction:'supported'},{kind:'narrative',target:'chain:start:family-support:20'}]},
    {id:'wait',label:'Ay sonunu bekle',description:'Ödemeyi ertelemeyi denersin.',effects:[{kind:'narrative',target:'stress:5'}]}
  ]},
  {id:'friend-city',category:'Yetişkinlik',source:'chat',title:'Bir şehir konuşması',text:'{actor}, başka bir şehirdeki fırsatı ciddi ciddi düşündüğünü anlatıyor.',stages:['working','retired'],actor:'friend',weight:7,cooldownDays:100,blocking:true,options:[
    {id:'encourage',label:'Onu cesaretlendir',description:'Uzun bir konuşma yaparsın.',timeMinutes:45,effects:[{kind:'interaction',target:'$actor',value:6,interaction:'supported'},{kind:'narrative',target:'chain:start:friend-move:35'}]},
    {id:'honest',label:'Kalmasını istediğini dürüstçe söyle',description:'Duygusal bir konuşma olur.',timeMinutes:40,effects:[{kind:'interaction',target:'$actor',value:1,interaction:'sharedTime'}]},
    {id:'change',label:'Konuyu başka güne bırak',description:'Şimdilik kararın dışında kalırsın.',effects:[{kind:'interaction',target:'$actor',value:-2,interaction:'disappointed'}]}
  ]},
  {id:'old-friend',category:'İleri yaşam',source:'chat',title:'Eski bir isim ekranda belirdi',text:'{actor}, yıllar sonra eski bir fotoğraf gönderip çay içmeyi öneriyor.',stages:['retired'],actor:'friend',weight:9,cooldownDays:90,blocking:true,options:[
    {id:'meet',label:'Buluşmayı ayarla',description:'Öğleden sonranı ayırırsın.',timeMinutes:150,effects:[{kind:'interaction',target:'$actor',value:8,interaction:'reconnected'},{kind:'narrative',target:'mood:8'}]},
    {id:'call',label:'Önce telefonlaş',description:'Kısa bir konuşma yaparsın.',timeMinutes:35,effects:[{kind:'interaction',target:'$actor',value:4,interaction:'reconnected'}]},
    {id:'leave',label:'Mesajı şimdilik beklet',description:'Bugünkü ritmini korursun.',effects:[{kind:'interaction',target:'$actor',value:-2,interaction:'declinedInvitation'}]}
  ]},
  {id:'routine-reflection',category:'İleri yaşam',source:'archive',title:'Sabahın ritmi değişiyor',text:'Son haftalarda günlerin birbirine benzediğini fark ediyorsun. {actor}, küçük bir değişikliğin iyi gelebileceğini söylüyor.',stages:['retired'],actor:'family',weight:6,cooldownDays:75,blocking:false,options:[
    {id:'new',label:'Yeni bir rutin dene',description:'Haftana kısa yürüyüşler eklersin.',effects:[{kind:'narrative',target:'health:4'},{kind:'narrative',target:'mood:4'}]},
    {id:'visit',label:'Yakınlarını daha sık ara',description:'Bu haftadan başlarsın.',effects:[{kind:'interaction',target:'$actor',value:4,interaction:'sharedTime'}]},
    {id:'keep',label:'Şimdilik aynı kal',description:'Değişimi sonraya bırakırsın.',effects:[{kind:'narrative',target:'stress:-1'}]}
  ]}
];
