/** Payload BR Code EMV para Pix estatico com valor definido no servidor. */
const normalize = (value: string, max: number) => value.normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7e]/g, "")
  .trim().slice(0, max);
const tlv = (id: string, value: string) => `${id}${String(value.length).padStart(2, "0")}${value}`;
function crc16(input: string) {
  let crc=0xffff;
  for (let i=0;i<input.length;i++) {
    crc ^= input.charCodeAt(i)<<8;
    for(let bit=0;bit<8;bit++) crc = (crc & 0x8000) ? ((crc<<1)^0x1021)&0xffff : (crc<<1)&0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4,"0");
}
export function createPixCode(key: string, name: string, city: string, cents: number) {
  if(!Number.isSafeInteger(cents)||cents<=0||!key.trim())throw new Error("Dados Pix invalidos");
  const merchant=tlv("00","BR.GOV.BCB.PIX")+tlv("01",key.trim());
  const body=tlv("00","01")+tlv("26",merchant)+tlv("52","0000")+tlv("53","986")+
    tlv("54",(cents/100).toFixed(2))+tlv("58","BR")+
    tlv("59",normalize(name,25))+tlv("60",normalize(city,15))+tlv("62",tlv("05","***"));
  const toSign=body+"6304";
  return toSign+crc16(toSign);
}
