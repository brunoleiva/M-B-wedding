import {getAdminContext} from "@/services/admin/dashboard";
import {FamilyEditor} from "../family-form";
export default async function NewFamily({searchParams}:{searchParams:Promise<{error?:string}>}){if(!(await getAdminContext()))return null;return <FamilyEditor members={[]} params={await searchParams}/>}
