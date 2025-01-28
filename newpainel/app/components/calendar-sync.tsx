import { useState, useEffect } from 'react'

interface CalendarEvent {
	id: string
	title: string
	start: Date
	end: Date
	description?: string
}

interface CalendarSyncProps {
	onEventAdd?: (event: CalendarEvent) => void
	onEventSync?: (events: CalendarEvent[]) => void
}

export function CalendarSync({ onEventAdd, onEventSync }: CalendarSyncProps) {
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [events, setEvents] = useState<CalendarEvent[]>([])

	// Inicializa o cliente do Google Calendar
	useEffect(() => {
		const script = document.createElement('script')
		script.src = 'https://apis.google.com/js/api.js'
		script.onload = () => {
			window.gapi.load('client:auth2', initClient)
		}
		document.body.appendChild(script)

		return () => {
			document.body.removeChild(script)
		}
	}, [])

	const initClient = () => {
		window.gapi.client
			.init({
				apiKey: process.env.GOOGLE_API_KEY,
				clientId: process.env.GOOGLE_CLIENT_ID,
				discoveryDocs: [
					'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
				],
				scope: 'https://www.googleapis.com/auth/calendar.readonly',
			})
			.then(() => {
				// Escuta mudanças no estado de autenticação
				window.gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus)
				// Define o estado inicial
				updateSigninStatus(
					window.gapi.auth2.getAuthInstance().isSignedIn.get()
				)
			})
	}

	const updateSigninStatus = (isSignedIn: boolean) => {
		setIsAuthenticated(isSignedIn)
		if (isSignedIn) {
			listUpcomingEvents()
		}
	}

	const handleAuthClick = () => {
		if (window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
			window.gapi.auth2.getAuthInstance().signOut()
		} else {
			window.gapi.auth2.getAuthInstance().signIn()
		}
	}

	const listUpcomingEvents = () => {
		window.gapi.client.calendar.events
			.list({
				calendarId: 'primary',
				timeMin: new Date().toISOString(),
				showDeleted: false,
				singleEvents: true,
				maxResults: 10,
				orderBy: 'startTime',
			})
			.then((response) => {
				const events = response.result.items.map((event: any) => ({
					id: event.id,
					title: event.summary,
					start: new Date(event.start.dateTime || event.start.date),
					end: new Date(event.end.dateTime || event.end.date),
					description: event.description,
				}))
				setEvents(events)
				if (onEventSync) onEventSync(events)
			})
	}

	return (
		<div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold text-gray-900 dark:text-white">
					Calendário
				</h2>
				<button
					onClick={handleAuthClick}
					className="rounded-md bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-500 dark:hover:bg-primary-600"
				>
					{isAuthenticated ? 'Desconectar' : 'Conectar ao Google Calendar'}
				</button>
			</div>

			{isAuthenticated && (
				<div className="mt-4">
					<h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
						Próximos Eventos
					</h3>
					<div className="space-y-2">
						{events.map((event) => (
							<div
								key={event.id}
								className="rounded-md border border-gray-200 p-3 dark:border-gray-700"
							>
								<h4 className="font-medium text-gray-900 dark:text-white">
									{event.title}
								</h4>
								<p className="mt-1 text-sm text-gray-500">
									{event.start.toLocaleString('pt-BR', {
										weekday: 'long',
										day: '2-digit',
										month: 'long',
										hour: '2-digit',
										minute: '2-digit',
									})}
								</p>
								{event.description && (
									<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
										{event.description}
									</p>
								)}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
} 