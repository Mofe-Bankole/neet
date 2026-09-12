import { PageShell, PageIntro, ActionLink } from '@/components/system';
export default function NotFound() {
  return (
    <PageShell>
      <PageIntro eyebrow="Page unavailable" title="This page isn’t here.">
        Check the link, or return to your workspace.
      </PageIntro>
      <ActionLink href="/app">Open workspace</ActionLink>
    </PageShell>
  );
}
