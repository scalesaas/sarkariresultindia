import { readchapterdetailsbyid } from '@/lib/actions/blog';
import BlogBody from '@/components/editor/BlogBody';
export default async function ChapterPage({
  params,
}: {
  params: { chapterSlug: string };
}) {
  const { data: chapter } = await readchapterdetailsbyid(params.chapterSlug);

  return (
    <>
      {chapter ? (
        <BlogBody source={chapter.content ?? ''} />
      ) : (
        <p className="mt-10 text-gray-500">Chapter not found.</p>
      )}
    </>
  );
}
