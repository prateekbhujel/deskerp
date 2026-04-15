<?php

namespace Tests\Feature\DeskERP;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Item;
use App\Models\Payment;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountingWorkflowHttpTest extends TestCase
{
    use RefreshDatabase;

    public function test_invoice_can_be_created_with_line_items_via_http(): void
    {
        $user = User::factory()->create();
        $customer = Customer::query()->create(['name' => 'Kathmandu Traders', 'is_active' => true]);
        $unit = Unit::query()->create(['name' => 'Piece', 'code' => 'PCS', 'is_active' => true]);
        $item = Item::query()->create([
            'unit_id' => $unit->id,
            'name' => 'DeskERP Ledger Book',
            'item_type' => 'stockable',
            'base_price' => 80,
            'selling_price' => 125,
            'tax_rate' => 13,
            'allow_discount' => true,
            'track_inventory' => true,
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)->post('/invoices', [
            'customer_id' => $customer->id,
            'issue_date' => now()->toDateString(),
            'status' => 'final',
            'reference_number' => 'SO-1001',
            'notes' => 'Urgent delivery',
            'lines' => [
                [
                    'item_id' => $item->id,
                    'description' => 'DeskERP Ledger Book',
                    'unit_name' => 'PCS',
                    'quantity' => 2,
                    'rate' => 125,
                    'discount_percent' => 0,
                    'tax_percent' => 13,
                ],
                [
                    'item_id' => null,
                    'description' => 'Setup Support',
                    'unit_name' => 'JOB',
                    'quantity' => 1,
                    'rate' => 50,
                    'discount_percent' => 0,
                    'tax_percent' => 0,
                ],
            ],
        ]);

        $invoice = Invoice::query()->firstOrFail();

        $response->assertRedirect(route('invoices.show', $invoice));
        $this->assertSame('final', $invoice->status);
        $this->assertSame(2, $invoice->lines()->count());
        $this->assertSame('332.50', (string) $invoice->total);
        $this->assertSame('unpaid', $invoice->payment_status);
    }

    public function test_payment_can_be_recorded_against_invoice_via_http(): void
    {
        $user = User::factory()->create();
        $customer = Customer::query()->create(['name' => 'Pokhara Books', 'is_active' => true]);
        $invoice = Invoice::query()->create([
            'customer_id' => $customer->id,
            'created_by_user_id' => $user->id,
            'invoice_number' => 'INV-2082-00001',
            'status' => 'final',
            'payment_status' => 'unpaid',
            'issue_date' => now()->toDateString(),
            'customer_name' => $customer->name,
            'subtotal' => '100.00',
            'discount_total' => '0.00',
            'tax_total' => '13.00',
            'total' => '113.00',
            'paid_total' => '0.00',
            'balance_due' => '113.00',
        ]);

        $response = $this->actingAs($user)->post('/payments', [
            'direction' => 'received',
            'customer_id' => $customer->id,
            'invoice_id' => $invoice->id,
            'payment_date' => now()->toDateString(),
            'method' => 'cash',
            'reference_number' => 'RCPT-1',
            'amount' => 100,
            'notes' => 'Part payment',
        ]);

        $payment = Payment::query()->firstOrFail();
        $invoice->refresh();

        $response->assertRedirect(route('payments.show', $payment));
        $this->assertSame((string) $invoice->paid_total, '100.00');
        $this->assertSame((string) $invoice->balance_due, '13.00');
        $this->assertSame('partial', $invoice->payment_status);
    }

    public function test_invoice_pdf_download_sanitizes_filename_when_invoice_number_contains_fiscal_year_slash(): void
    {
        $user = User::factory()->create();
        $customer = Customer::query()->create(['name' => 'Kathmandu Traders', 'is_active' => true]);

        $invoice = Invoice::query()->create([
            'customer_id' => $customer->id,
            'created_by_user_id' => $user->id,
            'invoice_number' => 'INV-2082/83-00001',
            'status' => 'final',
            'payment_status' => 'unpaid',
            'issue_date' => now()->toDateString(),
            'customer_name' => $customer->name,
            'subtotal' => '100.00',
            'discount_total' => '0.00',
            'tax_total' => '13.00',
            'total' => '113.00',
            'paid_total' => '0.00',
            'balance_due' => '113.00',
        ]);

        $response = $this->actingAs($user)->get(route('invoices.pdf', $invoice));

        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');
        $this->assertStringContainsString('INV-2082-83-00001.pdf', $response->headers->get('content-disposition', ''));
    }
}
