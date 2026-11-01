import { redirect } from 'next/navigation';

export default function ShortLinkRedirect({ params }: { params: { slug: string } }) {
  redirect(`/download/${params.slug}`);
}

