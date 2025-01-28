import { useState } from 'react'
import ICAL from 'ical.js'

interface CalendarEvent {
	id: string
	title: string
	start: Date
	end: Date
	description?: string
}

interface SimpleCalendarProps {
	onEventAdd?: (event: CalendarEvent) => void
	onEventsUpdate?: (events: CalendarEvent[]) => void
	onEventDelete?: (eventId: string) => void
	onEventEdit?: (event: CalendarEvent) => void
}

export function SimpleCalendar({
	onEventAdd,
	onEventsUpdate,
	onEventDelete,
	onEventEdit
}: SimpleCalendarProps) {
	const [events, setEvents] = useState<CalendarEvent[]>([])
	const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
	const [newEvent, setNewEvent] = useState({
		title: '',
		start: '',
		end: '',
		description: ''
	})

	// Adiciona novo evento
	const handleAddEvent = () => {
		if (!newEvent.title || !newEvent.start || !newEvent.end) return

		const event: CalendarEvent = {
			id: crypto.randomUUID(),
			title: newEvent.title,
			start: new Date(newEvent.start),
			end: new Date(newEvent.end),
			description: newEvent.description
		}

		const updatedEvents = [...events, event].sort(
			(a, b) => a.start.getTime() - b.start.getTime()
		)
		
		setEvents(updatedEvents)
		if (onEventAdd) onEventAdd(event)
		if (onEventsUpdate) onEventsUpdate(updatedEvents)

		setNewEvent({
			title: '',
			start: '',
			end: '',
			description: ''
		})
	}

	const handleDeleteEvent = (eventId: string) => {
		const updatedEvents = events.filter((event) => event.id !== eventId)
		setEvents(updatedEvents)
		if (onEventDelete) onEventDelete(eventId)
		if (onEventsUpdate) onEventsUpdate(updatedEvents)
	}

	const handleEditEvent = (event: CalendarEvent) => {
		setEditingEvent(event)
		setNewEvent({
			title: event.title,
			start: event.start.toISOString().slice(0, 16),
			end: event.end.toISOString().slice(0, 16),
			description: event.description || ''
		})
	}

	const handleUpdateEvent = () => {
		if (!editingEvent || !newEvent.title || !newEvent.start || !newEvent.end) return

		const updatedEvent: CalendarEvent = {
			id: editingEvent.id,
			title: newEvent.title,
			start: new Date(newEvent.start),
			end: new Date(newEvent.end),
			description: newEvent.description
		}

		const updatedEvents = events.map((event) =>
			event.id === editingEvent.id ? updatedEvent : event
		).sort((a, b) => a.start.getTime() - b.start.getTime())

		setEvents(updatedEvents)
		setEditingEvent(null)
		setNewEvent({
			title: '',
			start: '',
			end: '',
			description: ''
		})

		if (onEventEdit) onEventEdit(updatedEvent)
		if (onEventsUpdate) onEventsUpdate(updatedEvents)
	}

	const handleCancelEdit = () => {
		setEditingEvent(null)
		setNewEvent({
			title: '',
			start: '',
			end: '',
			description: ''
		})
	}

	// Exporta eventos para arquivo ICS
	const exportToICS = () => {
		const calendar = new ICAL.Component(['vcalendar', [], []])
		calendar.updatePropertyWithValue('prodid', '-//Painel TDAH//PT-BR')
		calendar.updatePropertyWithValue('version', '2.0')

		events.forEach(event => {
			const vevent = new ICAL.Component('vevent')
			vevent.updatePropertyWithValue('uid', event.id)
			vevent.updatePropertyWithValue('summary', event.title)
			vevent.updatePropertyWithValue('dtstart', ICAL.Time.fromJSDate(event.start))
			vevent.updatePropertyWithValue('dtend', ICAL.Time.fromJSDate(event.end))
			if (event.description) {
				vevent.updatePropertyWithValue('description', event.description)
			}
			calendar.addSubcomponent(vevent)
		})

		const blob = new Blob([calendar.toString()], { type: 'text/calendar' })
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = 'meus-eventos.ics'
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
		URL.revokeObjectURL(url)
	}

	// Importa eventos de arquivo ICS
	const importFromICS = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file) return

		const reader = new FileReader()
		reader.onload = (e) => {
			const data = e.target?.result as string
			const jcalData = ICAL.parse(data)
			const comp = new ICAL.Component(jcalData)
			const vevents = comp.getAllSubcomponents('vevent')

			const importedEvents: CalendarEvent[] = vevents.map(vevent => ({
				id: vevent.getFirstPropertyValue('uid') || crypto.randomUUID(),
				title: vevent.getFirstPropertyValue('summary'),
				start: vevent.getFirstPropertyValue('dtstart').toJSDate(),
				end: vevent.getFirstPropertyValue('dtend').toJSDate(),
				description: vevent.getFirstPropertyValue('description')
			}))

			const updatedEvents = [...events, ...importedEvents].sort(
				(a, b) => a.start.getTime() - b.start.getTime()
			)
			
			setEvents(updatedEvents)
			if (onEventsUpdate) onEventsUpdate(updatedEvents)
		}
		reader.readAsText(file)
	}

	return (
		<div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 border-2 border-transparent hover:border-primary-300 transition-all duration-300">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
					Calendário
				</h2>
				<div className="flex gap-2">
					<button
						onClick={exportToICS}
						className="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-200 transition-all duration-300"
						aria-label="Exportar eventos para arquivo ICS"
					>
						Exportar ICS
					</button>
					<label className="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-200 transition-all duration-300 cursor-pointer">
						Importar ICS
						<input
							type="file"
							accept=".ics"
							onChange={importFromICS}
							className="hidden"
						/>
					</label>
				</div>
			</div>

			<div className="mt-6">
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Título
						</label>
						<input
							type="text"
							value={newEvent.title}
							onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
							className="mt-1 block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-all duration-300"
							placeholder={editingEvent ? 'Edite o título do evento...' : 'Título do evento...'}
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
								Início
							</label>
							<input
								type="datetime-local"
								value={newEvent.start}
								onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
								className="mt-1 block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-all duration-300"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
								Fim
							</label>
							<input
								type="datetime-local"
								value={newEvent.end}
								onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
								className="mt-1 block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-all duration-300"
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Descrição
						</label>
						<textarea
							value={newEvent.description}
							onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
							className="mt-1 block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-all duration-300"
							rows={3}
							placeholder={editingEvent ? 'Edite a descrição do evento...' : 'Descrição do evento...'}
						/>
					</div>
					<div className="flex gap-2">
						<button
							onClick={editingEvent ? handleUpdateEvent : handleAddEvent}
							className="flex-1 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-200 transition-all duration-300"
							aria-label={editingEvent ? 'Salvar edição do evento' : 'Adicionar evento'}
						>
							{editingEvent ? 'Salvar Edição' : 'Adicionar Evento'}
						</button>
						{editingEvent && (
							<button
								onClick={handleCancelEdit}
								className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-all duration-300"
								aria-label="Cancelar edição"
							>
								Cancelar
							</button>
						)}
					</div>
				</div>

				<div className="mt-6">
					<h3 className="mb-4 text-lg font-medium text-gray-700 dark:text-gray-300">
						Eventos
					</h3>
					<div className="space-y-4">
						{events.map((event) => (
							<div
								key={event.id}
								className="group relative rounded-lg border-2 border-gray-200 p-4 hover:border-primary-300 dark:border-gray-700 dark:hover:border-primary-500 transition-all duration-300"
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
										minute: '2-digit'
									})}
								</p>
								{event.description && (
									<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
										{event.description}
									</p>
								)}
								
								{/* Botões de ação */}
								<div className="absolute right-2 top-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
									<button
										onClick={() => handleEditEvent(event)}
										className="rounded-md bg-primary-100 p-2 text-primary-600 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-primary-400 dark:hover:bg-gray-600"
										aria-label="Editar evento"
									>
										<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
										</svg>
									</button>
									<button
										onClick={() => handleDeleteEvent(event.id)}
										className="rounded-md bg-red-100 p-2 text-red-600 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-gray-600"
										aria-label="Excluir evento"
									>
										<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
} 