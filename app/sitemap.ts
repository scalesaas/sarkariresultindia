import type { MetadataRoute } from 'next'
import { readBlog, readchapter } from "@/lib/actions/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap>  {
    let { data: blogs } = await readBlog();
    let { data: chapters } = await readchapter();

    // Map blogs to postEntries with required properties
    const postEntries = blogs?.map((blog) => ({
        url: `${process.env.SITE_URL}/blog/${blog?.slug}`,
        lastModified: new Date(blog.created_at),
        changeFrequency: 'weekly', // Default value
        priority: 0.5, // Default value
    }));

    const chapterentries = chapters?.map((chapter) => ({
        url: `${process.env.SITE_URL}/chapter/${chapter?.slug}`,
        lastModified: new Date(chapter.created_at),
        changeFrequency: 'weekly', // Default value
        priority: 0.5, // Default value
    }));

    // Static entries for aboutus, privacypolicy, contactus
    const staticEntries = [
        { url: `${process.env.SITE_URL}/aboutus` },
        { url: `${process.env.SITE_URL}/contactus` },
    ];

    // Combine static entries with postEntries
    const allEntries: MetadataRoute.Sitemap = [...staticEntries, ...(postEntries ?? []) , ...(chapterentries?? []) ];

    return allEntries;
}
