import React from 'react'
import { ShieldAlert } from 'lucide-react'
import { useKds } from '../hooks/useKds'
import Modal from '../../../components/Modal'
import Button from '../../../components/Button'

export default function ChefRestrictionModal() {
  const { isRestrictionModalOpen, setIsRestrictionModalOpen } = useKds()

  return (
    <Modal
      isOpen={isRestrictionModalOpen}
      onClose={() => setIsRestrictionModalOpen(false)}
      title="Chef Role Permission Restriction"
    >
      <div className="space-y-4 text-xs select-none">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
          <ShieldAlert className="w-6 h-6 text-zinc-900 dark:text-zinc-100 shrink-0" />
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
            Enforcing Back-of-House Security Policy (US-BOH-02)
          </p>
        </div>

        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Kitchen Chefs do not have authorization to cancel orders or alter menu item availability.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Only the <strong className="text-zinc-900 dark:text-zinc-100">Restaurant Owner / Admin</strong> can initiate refunds, cancel paid tickets, or toggle recipe stock availability.
        </p>

        <div className="pt-2 flex justify-end">
          <Button
            onClick={() => setIsRestrictionModalOpen(false)}
            variant="primary"
            size="sm"
          >
            Understood
          </Button>
        </div>
      </div>
    </Modal>
  )
}
