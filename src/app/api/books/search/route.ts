import { NextResponse } from 'next/server'

export interface BookResult {
  id: string
  title: string
  author: string
  image: string
  year: number | null
  pageCount: number | null
  description: string
  openLibraryUrl: string
  isbn: string | null
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim()

    if (!q) return NextResponse.json({ results: [] })

    const res = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=10&fields=key,title,author_name,first_publish_year,number_of_pages_median,cover_i,isbn`,
      { next: { revalidate: 300 } }
    )

    if (!res.ok) throw new Error('Open Library search failed')

    const data = await res.json()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = (data.docs ?? []).slice(0, 10).map((book: any): BookResult => {
      const coverId = book.cover_i
      const image = coverId
        ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
        : ''
      const isbn = book.isbn?.[0] ?? null
      const key = book.key?.replace('/works/', '') ?? ''

      return {
        id: key || `${book.title}-${book.first_publish_year}`,
        title: book.title ?? '',
        author: book.author_name?.[0] ?? '',
        image,
        year: book.first_publish_year ?? null,
        pageCount: book.number_of_pages_median ?? null,
        description: '',
        openLibraryUrl: `https://openlibrary.org${book.key}`,
        isbn,
      }
    }).filter((b: BookResult) => b.title)

    return NextResponse.json({ results })
  } catch (err) {
    console.error('Books search error:', err)
    return NextResponse.json({ results: [], error: 'search failed' }, { status: 500 })
  }
}
