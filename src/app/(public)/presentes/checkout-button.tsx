"use client";
import {useFormStatus} from "react-dom";
export function CheckoutButton({amount}:{amount:string}){
  const {pending}=useFormStatus();
  return <button className="admin-btn admin-btn--primary min-h-12 w-full text-base" type="submit" disabled={pending} aria-disabled={pending} aria-busy={pending}>
    {pending?"Gerando seu Pix...":`Gerar Pix de ${amount} →`}
  </button>;
}
