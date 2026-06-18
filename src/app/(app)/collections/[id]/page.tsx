import { CollectionDetailClient } from './CollectionDetailClient'

interface Props { params: Promise<{ id: string }> }

export default async function CollectionDetailPage({ params }: Props) {
  const { id } = await params
  return <CollectionDetailClient id={id} />
}
