import ReceiptView from '@/components/ReceiptView';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <ReceiptView id={(await params).id} />;
}
