"use client";
import {useFormStatus} from "react-dom";
export function CheckoutButton({amount}:{amount:string}){
  const {pending}=useFormStatus();
  return <button className="admin-btn admin-btn--primary w-full" type="submit" disabled={pending} aria-disabled={pending}>
    {pending?"Gerando Pix...":`Gerar Pix de ${amount}`}
  </button>;
}
