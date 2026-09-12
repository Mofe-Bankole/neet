import AcknowledgeForm from '@/components/AcknowledgeForm';
export default async function Page({ searchParams }: { searchParams: Promise<{ to?: string }> }) {
  const p = await searchParams;
  return <AcknowledgeForm recipient={typeof p.to === 'string' ? p.to : ''} />;
}
