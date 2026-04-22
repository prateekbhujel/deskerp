<?php

namespace Tests\Feature\DeskERP;

use App\Models\Customer;
use App\Models\Invoice;
use App\Services\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class PaymentLogicTest extends TestCase
{
    use RefreshDatabase;

    public function test_payments_update_invoice_outstanding_balance(): void
    {
        $customer = Customer::query()->create(['name' => 'Blue Store']);

        $invoice = Invoice::query()->create([
            'customer_id' => $customer->id,
            'invoice_number' => 'INV-00001',
            'status' => 'final',
            'payment_status' => 'unpaid',
            'issue_date' => now()->toDateString(),
            'customer_name' => $customer->name,
            'subtotal' => 200,
            'discount_total' => 0,
            'tax_total' => 0,
            'total' => 200,
            'paid_total' => 0,
            'balance_due' => 200,
        ]);

        $service = app(PaymentService::class);

        $service->store([
            'direction' => 'received',
            'invoice_id' => $invoice->id,
            'payment_date' => now()->toDateString(),
            'method' => 'cash',
            'amount' => 75,
        ]);

        $invoice->refresh();

        $this->assertSame('75.00', (string) $invoice->paid_total);
        $this->assertSame('125.00', (string) $invoice->balance_due);
        $this->assertSame('partial', $invoice->payment_status);

        $service->store([
            'direction' => 'received',
            'invoice_id' => $invoice->id,
            'payment_date' => now()->toDateString(),
            'method' => 'bank',
            'amount' => 125,
        ]);

        $invoice->refresh();

        $this->assertSame('200.00', (string) $invoice->paid_total);
        $this->assertSame('0.00', (string) $invoice->balance_due);
        $this->assertSame('paid', $invoice->payment_status);
    }

    public function test_payment_cannot_exceed_invoice_balance(): void
    {
        $customer = Customer::query()->create(['name' => 'Green Mart']);

        $invoice = Invoice::query()->create([
            'customer_id' => $customer->id,
            'invoice_number' => 'INV-00002',
            'status' => 'final',
            'payment_status' => 'unpaid',
            'issue_date' => now()->toDateString(),
            'customer_name' => $customer->name,
            'subtotal' => 100,
            'discount_total' => 0,
            'tax_total' => 0,
            'total' => 100,
            'paid_total' => 0,
            'balance_due' => 100,
        ]);

        $this->expectException(ValidationException::class);

        app(PaymentService::class)->store([
            'direction' => 'received',
            'invoice_id' => $invoice->id,
            'payment_date' => now()->toDateString(),
            'method' => 'cash',
            'amount' => 150,
        ]);
    }

    public function test_payment_cannot_be_linked_to_draft_invoice(): void
    {
        $customer = Customer::query()->create(['name' => 'Draft Check']);

        $invoice = Invoice::query()->create([
            'customer_id' => $customer->id,
            'invoice_number' => 'INV-00003',
            'status' => 'draft',
            'payment_status' => 'unpaid',
            'issue_date' => now()->toDateString(),
            'customer_name' => $customer->name,
            'subtotal' => 100,
            'discount_total' => 0,
            'tax_total' => 0,
            'total' => 100,
            'paid_total' => 0,
            'balance_due' => 100,
        ]);

        try {
            app(PaymentService::class)->store([
                'direction' => 'received',
                'invoice_id' => $invoice->id,
                'payment_date' => now()->toDateString(),
                'method' => 'cash',
                'amount' => 20,
            ]);

            $this->fail('Expected draft invoice validation exception was not thrown.');
        } catch (ValidationException $exception) {
            $this->assertSame(
                'Payment can only be linked to finalized invoices.',
                $exception->errors()['invoice_id'][0] ?? ''
            );
        }
    }
}
