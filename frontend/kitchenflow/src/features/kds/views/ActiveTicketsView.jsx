import React from 'react'
import { CheckCircle2, Plus } from 'lucide-react'
import { useKds } from '../hooks/useKds'
import TicketCard from '../components/TicketCard'
import Button from '../../../components/Button'

export default function ActiveTicketsView() {
  const { activeTickets, simulateOrder } = useKds()

  if (activeTickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center select-none">
        <CheckCircle2 className="w-14 h-14 text-zinc-300 dark:text-zinc-700 mb-3" />
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
          Kitchen Queue Clear!
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs">
          All orders have been prepared and bumped. New orders will appear here automatically.
        </p>
        <div className="mt-5">
          <Button
            onClick={simulateOrder}
            variant="primary"
            size="sm"
            icon={Plus}
          >
            Add Test Order
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 pb-12">
      {activeTickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  )
}
