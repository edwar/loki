'use client'

import { useState, useTransition } from 'react'
import { PurchaseForm } from '@/components/purchase-form'

interface Supplier {
  id: string
  name: string
}

interface PurchaseFormWrapperProps {
  suppliers: Supplier[]
}

export function PurchaseFormWrapper({ suppliers }: PurchaseFormWrapperProps) {
  const [, startTransition] = useTransition()

  const handleSuccess = () => {
    startTransition(() => {
      window.location.reload()
    })
  }

  return <PurchaseForm suppliers={suppliers} onPurchaseSuccess={handleSuccess} />
}