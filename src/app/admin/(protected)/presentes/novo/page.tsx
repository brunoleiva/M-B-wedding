import {getAdminGifts} from "@/services/gifts/admin";
import {GiftEditor} from "../gift-form";
export default async function NewGift({searchParams}:{searchParams:Promise<{error?:string}>}){const {categories}=await getAdminGifts();const params=await searchParams;return <GiftEditor categories={categories} error={params.error}/>;}
