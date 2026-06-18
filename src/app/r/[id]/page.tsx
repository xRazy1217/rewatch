import { RecommendationDetail } from './RecommendationDetail'

interface Props { params: Promise<{ id: string }> }

export default async function Page({ params }: Props) {
  const { id } = await params
  return <RecommendationDetail id={id} />
}
