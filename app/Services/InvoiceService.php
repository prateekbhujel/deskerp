<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\User;
use App\Support\Decimal;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InvoiceService
{
    public function __construct(
        private readonly InvoiceCalculatorService $calculator,
        private readonly InventoryService $inventoryService,
        private readonly SequenceService $sequenceService,
    ) {}

    public function store(array $data, User $user): Invoice
    {
        return $this->persist(new Invoice, $data, $user);
    }

    public function update(Invoice $invoice, array $data, User $user): Invoice
    {
        return $this->persist($invoice, $data, $user);
    }

    public function refreshBalances(Invoice $invoice): Invoice
    {
        $paidTotal = $invoice->payments()
            ->where('direction', 'received')
            ->sum('amount');

        $balanceDue = Decimal::subtract($invoice->total, $paidTotal, 2);
        $paymentStatus = 'unpaid';

        if (Decimal::compare($paidTotal, 0) > 0 && Decimal::compare($balanceDue, 0) > 0) {
            $paymentStatus = 'partial';
        }

        if (Decimal::compare($balanceDue, 0) <= 0) {
            $paymentStatus = 'paid';
            $balanceDue = '0.00';
        }

        $invoice->update([
            'paid_total' => Decimal::normalize($paidTotal, 2),
            'balance_due' => $balanceDue,
            'payment_status' => $paymentStatus,
        ]);

        return $invoice->fresh(['customer', 'lines.item', 'payments']);
    }

    private function persist(Invoice $invoice, array $data, User $user): Invoice
    {
        return DB::transaction(function () use ($invoice, $data, $user): Invoice {
            $customer = Customer::query()->findOrFail($data['customer_id']);
            $calculated = $this->calculator->calculate($data['lines']);
            $paidTotal = $invoice->exists ? (string) $invoice->paid_total : '0.00';

            if (Decimal::compare($paidTotal, $calculated['total']) > 0) {
                throw ValidationException::withMessages([
                    'lines' => 'Invoice total cannot be reduced below already received payments.',
                ]);
            }

            if (! $invoice->exists) {
                $invoice->invoice_number = $this->sequenceService->nextInvoiceNumber();
            }

            $status = $data['status'] ?? 'draft';

            $invoice->fill([
                'customer_id' => $customer->id,
                'created_by_user_id' => $invoice->created_by_user_id ?: $user->id,
                'status' => $status,
                'issue_date' => $data['issue_date'],
                'due_date' => $data['due_date'] ?? null,
                'reference_number' => $data['reference_number'] ?? null,
                'customer_name' => $customer->name,
                'billing_address' => $customer->billing_address,
                'tax_number' => $customer->tax_number,
                'notes' => $data['notes'] ?? null,
                'subtotal' => $calculated['subtotal'],
                'discount_total' => $calculated['discount_total'],
                'tax_total' => $calculated['tax_total'],
                'total' => $calculated['total'],
                'paid_total' => $paidTotal,
                'balance_due' => Decimal::subtract($calculated['total'], $paidTotal, 2),
                'payment_status' => Decimal::compare($paidTotal, 0) > 0 ? 'partial' : 'unpaid',
                'finalized_at' => $status === 'final' ? ($invoice->finalized_at ?? now()) : null,
            ]);

            if (Decimal::compare($invoice->balance_due, 0) <= 0) {
                $invoice->payment_status = 'paid';
                $invoice->balance_due = '0.00';
            }

            $invoice->save();

            $invoice->lines()->delete();

            foreach ($calculated['lines'] as $line) {
                $invoice->lines()->create($line);
            }

            $this->inventoryService->syncInvoiceStock($invoice->fresh('lines.item'));

            return $this->refreshBalances($invoice);
        });
    }
}
