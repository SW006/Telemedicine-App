
import React from 'react'

export default function NotFound(): React.ReactElement {
	return (
		<main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-800">
			<div className="flex min-h-screen items-center justify-center px-6 text-center">
				<div className="mx-auto max-w-2xl">
					<h1 className="text-4xl font-bold text-gray-900">Page not found</h1>
					<p className="mt-3 text-lg text-gray-600">
						Sorry, we couldn&apos;t find the page you&apos;re looking for.
					</p>
				</div>
			</div>
		</main>
	)
}

