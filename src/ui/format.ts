export const money=(n:number)=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(n/100);
export const date=(s:string,o?:Intl.DateTimeFormatOptions)=>new Intl.DateTimeFormat('tr-TR',o||{dateStyle:'medium'}).format(new Date(s));
export const time=(s:string)=>new Date(s).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});
