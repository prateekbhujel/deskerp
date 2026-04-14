<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Payment;
use App\Support\Decimal;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentService
{
    public function __construct(
        private readonly InvoiceService $invoiceService,
        private readonly SequenceService $sequenceService,
    ) {}

    public function store(array $data): Payment
    {
        return $this->persist(new Payment, $data);
    }

    public function update(Payment $payment, array $data): Payment
    {
        return $this->persist($payment, $data);
    }

    public function delete(Payment $payment): void
    {
        DB::transaction(function () use ($payment): void {
            $invoice = $payment->invoice;
            $payment->delete();

            if ($invoice) {
                $this->invoiceService->refreshBalances($invoice);
            }
        });
    }

    private function persist(Payment $payment, array $data): Payment
    {
        return DB::transaction(function () use ($payment, $data): Payment {
            $invoice = ! empty($data['invoice_id'])
                ? Invoice::query()->findOrFail($data['invoice_id'])
                : null;

            if (! $payment->exists) {
                $payment->payment_number = $this->sequenceService->nextPaymentNumber($data['direction']);
            }

            if ($data['direction'] === 'received' && ! $invoice && empty($data['customer_id'])) {
                throw ValidationException::withMessages([
                    'customer_id' => 'Customer is required for payment received.',
                ]);
            }

            if ($data['direction'] === 'made' && empty($data['supplier_id'])) {
                throw ValidationException::withMessages([
                    'supplier_id' => 'Supplier is required for payment made.',
                ]);
            }

            if ($invoice) {
                $remainingBalance = Decimal::subtract(
                    $invoice->total,
                    $invoice->payments()
                        ->where('direction', 'received')
                        ->whereKeyNot($payment->id)
                        ->sum('amount'),
                    2,
                );

                if (Decimal::compare($data['amount'], $remainingBalance) > 0) {
                    throw ValidationException::withMessages([
                        'amount' => 'Payment cannot exceed the invoice outstanding balance.',
                    ]);
                }
            }

            $payment->fill([
                'direction' => $data['direction'],
                'customer_id' => $invoice?->customer_id ?? ($data['direction'] === 'received' ? ($data['customer_id'] ?? null) : null),
                'supplier_id' => $data['direction'] === 'made' ? ($data['supplier_id'] ?? null) : null,
                'invoice_id' => $invoice?->id,
                'payment_date' => $data['payment_date'],
                'method' => $data['method'],
                'reference_number' => $data['reference_number'] ?? null,
                'amount' => Decimal::normalize($data['amount'], 2),
                'notes' => $data['notes'] ?? null,
            ]);

            $payment->save();

            if ($invoice) {
                $this->invoiceService->refreshBalances($invoice);
            }

            return $payment->fresh(['customer', 'supplier', 'invoice']);
        });
    }
}
