import { createSupabaseServerClient } from "@/lib/supabase/server";

export type StoryItem = { id: string; year: string; title: string; description: string; imageUrl?: string };
export type GalleryItem = { id: string; alt: string; caption: string; url: string; isCover: boolean };

export async function getPublicContent() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { story: [] as StoryItem[], gallery: [] as GalleryItem[] };
  const { data: wedding } = await supabase.from("weddings").select("id")
    .eq("is_published", true).order("created_at").limit(1).maybeSingle();
  if (!wedding) return { story: [] as StoryItem[], gallery: [] as GalleryItem[] };
  const [stories, photos] = await Promise.all([
    supabase.from("story_events").select("id,year_label,occurred_on,title,description,image_path")
      .eq("wedding_id", wedding.id).is("deleted_at",null).eq("is_published", true).order("sort_order").order("created_at"),
    supabase.from("gallery_images").select("id,alt_text,caption,storage_path,is_cover")
      .eq("wedding_id", wedding.id).is("deleted_at",null).eq("is_published", true).order("sort_order").order("created_at"),
  ]);
  const mediaUrl = (path: string) => supabase.storage.from("wedding-media").getPublicUrl(path).data.publicUrl;
  return {
    story: (stories.data ?? []).map(item => ({ id: item.id as string, year: item.year_label || item.occurred_on?.slice(0, 4) || "", title: item.title, description: item.description, imageUrl: item.image_path ? mediaUrl(item.image_path) : undefined })),
    gallery: (photos.data ?? []).map(item => ({ id: item.id as string, alt: item.alt_text, caption: item.caption || "", url: mediaUrl(item.storage_path), isCover: item.is_cover })),
  };
}
