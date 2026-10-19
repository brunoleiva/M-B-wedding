import type {GiftPayment} from "./types";

type RecordPayment=GiftPayment & {deleted_at:string|null};
export type FinancialFilters={q:string;status:string;from:string;to:string;page:string};
const statuses=new Set(["","pending_confirmation","expired","confirmed","rejected","archived"]);
const datePattern=/^\d{4}-\d{2}-\d{2}$/;
function dateOrEmpty(value:unknown){
 if(typeof value!=="string"||!datePattern.test(value))return "";
 const date=new Date(`${value}T00:00:00Z`);
 return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===value?value:"";
}
export function readFinancialFilters(raw:{q?:string;status?:string;from?:string;to?:string;page?:string}):FinancialFilters{
 const status=raw.status??"";
 return {q:(raw.q??"").trim().slice(0,120),status:statuses.has(status)?status:"",
  from:dateOrEmpty(raw.from),to:dateOrEmpty(raw.to),page:String(Math.min(100000,Math.max(1,Number.parseInt(raw.page??"1",10)||1)))};
}
export function financialStatus(p:Pick<GiftPayment,"status"|"expires_at">,now=Date.now()){
 if(p.status==="pending_confirmation"&&p.expires_at&&new Date(p.expires_at).getTime()<=now)return "expired";
 return p.status;
}
export function filterFinancialPayments(
 payments:RecordPayment[],filters:FinancialFilters,giftName:(giftId:string)=>string
){
 const query=filters.q.toLocaleLowerCase("pt-BR");
 const now=Date.now();
 const from=filters.from?Date.parse(`${filters.from}T00:00:00Z`):null;
 const to=filters.to?Date.parse(`${filters.to}T00:00:00Z`)+86400000:null;
 return payments.filter(p=>{
  const archived=Boolean(p.deleted_at);
  if(filters.status==="archived"){if(!archived)return false;}
  else if(archived||filters.status&&financialStatus(p,now)!==filters.status)return false;
  const when=new Date(p.created_at).getTime();
  if(from!==null&&when<from||to!==null&&when>=to)return false;
  const ref=p.checkout_token?`MB-${p.checkout_token.slice(0,8)}`:`ID-${p.id.slice(0,8)}`;
  return !query||[p.guest_name,p.message??"",giftName(p.gift_id??""),ref,p.id].some(s=>s.toLocaleLowerCase("pt-BR").includes(query));
 });
}
