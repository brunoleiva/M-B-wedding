import {notFound} from "next/navigation";
import {getAdminGifts} from "@/services/gifts/admin";
import {GiftEditor} from "../gift-form";
export default async function GiftDetail({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{error?:string}>}){const {id}=await params;const {gifts,categories}=await getAdminGifts();const gift=gifts.find(g=>g.id===id);if(!gift)notFound();return <GiftEditor gift={gift} categories={categories} error={(await searchParams).error}/>;}
