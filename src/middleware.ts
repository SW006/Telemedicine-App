import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
	const url = new URL(request.url)
	const originalPath = url.pathname

	// Normalize any accidental leading space + route group appearing in path
	// e.g., "/%20(dashboard)/doctor/..." -> "/doctor/..."
	const cleanedPath = originalPath.replace(/^\/%20\(dashboard\)\//, '/').replace(/^\(dashboard\)\//, '/')

	if (cleanedPath !== originalPath) {
		url.pathname = cleanedPath
		return NextResponse.redirect(url)
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!_next|api|.*\\..*).*)'],
}


