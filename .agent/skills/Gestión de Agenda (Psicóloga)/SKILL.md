---
description: Gestión del calendario de disponibilidad de la psicóloga en PsicoConnect. Usar cuando se trabaje en la creación, edición o eliminación de slots de disponibilidad, bloqueo de fechas, vista semanal/mensual del calendario, o cualquier funcionalidad relacionada con la agenda de la psicóloga.
---

Skill: Gestión de Agenda (Psicóloga)
Este skill cubre todo lo relacionado con la disponibilidad horaria de la psicóloga: crear slots, bloquearlos, editarlos y mostrarlos visualmente al paciente.
Cuándo usar este skill

Cuando se implemente el calendario de disponibilidad de la psicóloga
Cuando se trabaje en la creación individual o en lote de slots
Cuando se gestionen bloqueos de fechas (vacaciones, días no laborables)
Cuando se construya la vista del calendario para el paciente (slots libres)
Cuando se valide la regla de máximo de sesiones por día

Modelo de datos
typescript// Tabla: availability_slots
{
id: uuid
psicologa_id: uuid // FK → profiles
start_at: timestamptz // inicio del slot
end_at: timestamptz // fin del slot (start_at + duration)
duration_minutes: 30|45|50|60|90
price: numeric // precio en COP
session_type: 'inicial' | 'seguimiento' | 'evaluacion'
is_available: boolean // false cuando tiene cita activa asociada
created_at: timestamptz
}

// Tabla: availability_blocks
{
id: uuid
psicologa_id: uuid
starts_at: date
ends_at: date
reason: string | null
}
Server Actions requeridas
typescriptcreateSlot(data: CreateSlotDTO): Promise<Slot>
createSlotsBatch(data: BatchSlotDTO): Promise<Slot[]> // ej: todos los martes 9-12
deleteSlot(slotId: string): Promise<void> // solo si no tiene cita activa
updateSlot(slotId: string, data: Partial<Slot>): Promise<Slot>
blockDateRange(start: Date, end: Date, reason?: string): Promise<void>
getAvailableSlots(psicologaId: string, from: Date, to: Date): Promise<Slot[]>
Reglas de negocio a respetar

AG-02: No mostrar slots con menos de 24h de antelación desde ahora
AG-03: Solo role = 'psicologa' puede crear/editar/eliminar slots (validar en server action Y en RLS)
AG-04: Al crear una cita, marcar slot.is_available = false de forma atómica
AG-06: Filtrar slots que caigan dentro de un availability_block antes de mostrarlos
AG-07: Máximo psicologa.max_daily_sessions slots por día (default: 8). Lanzar error si se supera

Componentes de UI
CalendarView (weekly/monthly)
├── SlotCard → color según estado: verde/naranja/azul/gris
├── SlotEditor → panel lateral: duración, precio, tipo
├── BlockDateModal → date range picker para bloquear
└── BatchCreateModal → crear slots en lote por patrón semanal
Colores de estado:

libre → #6BBF9E (verde)
pendiente_pago / pendiente_aprobacion → #F0A500 (naranja)
confirmada → #4A90D9 (azul)
bloqueado → #94A3B8 (gris)

Librería de calendario recomendada
Usar FullCalendar (versión gratuita) con la vista timeGridWeek. Configuración mínima:
typescript<FullCalendar
plugins={[timeGridPlugin, interactionPlugin]}
initialView="timeGridWeek"
selectable={true} // drag para crear slot
select={handleCreateSlot}
events={slotsAsEvents}
eventClick={handleEditSlot}
/>
Política de eliminación de slots

Solo se puede eliminar un slot si is_available = true (sin cita asociada)
Si tiene cita asociada en cualquier estado activo → mostrar error: "Este horario tiene una cita activa y no puede eliminarse"
Slots en estado EXPIRED o CANCELLED liberan el slot automáticamente vía cron

Acceso en Supabase (RLS)
sql-- Psicóloga solo ve y edita sus propios slots
CREATE POLICY "psicologa_own_slots" ON availability_slots
FOR ALL USING (psicologa_id = auth.uid());

-- Pacientes solo pueden leer slots disponibles
CREATE POLICY "patient_read_available_slots" ON availability_slots
FOR SELECT USING (is_available = true);
