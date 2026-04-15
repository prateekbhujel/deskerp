<?php

namespace Tests\Feature\DeskERP;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_sales_report_supports_csv_and_xlsx_exports(): void
    {
        $user = User::factory()->create();
        $customer = Customer::query()->create(['name' => 'Lalitpur Stationers', 'is_active' => true]);

        Invoice::query()->create([
            'customer_id' => $customer->id,
            'created_by_user_id' => $user->id,
            'invoice_number' => 'INV-2082-00002',
            'status' => 'final',
            'payment_status' => 'unpaid',
            'issue_date' => now()->toDateString(),
            'customer_name' => $customer->name,
            'subtotal' => '200.00',
            'discount_total' => '0.00',
            'tax_total' => '26.00',
            'total' => '226.00',
            'paid_total' => '0.00',
            'balance_due' => '226.00',
        ]);

        $csvResponse = $this->actingAs($user)->get('/reports/sales?export=csv');
        $xlsxResponse = $this->actingAs($user)->get('/reports/sales?export=xlsx');

        $csvResponse->assertOk();
        $csvResponse->assertHeader('content-disposition', 'attachment; filename=deskerp-sales-report.csv');
        $this->assertStringContainsString('INV-2082-00002', $csvResponse->streamedContent());

        $xlsxResponse->assertOk();
        $xlsxResponse->assertHeader('content-disposition', 'attachment; filename=deskerp-sales-report.xlsx');
    }

    public function test_payment_report_supports_csv_and_xlsx_exports(): void
    {
        $user = User::factory()->create();
        $customer = Customer::query()->create(['name' => 'Bhaktapur Office Mart', 'is_active' => true]);
        $invoice = Invoice::query()->create([
            'customer_id' => $customer->id,
            'created_by_user_id' => $user->id,
            'invoice_number' => 'INV-2082-00003',
            'status' => 'final',
            'payment_status' => 'partial',
            'issue_date' => now()->toDateString(),
            'customer_name' => $customer->name,
            'subtotal' => '150.00',
            'discount_total' => '0.00',
            'tax_total' => '19.50',
            'total' => '169.50',
            'paid_total' => '100.00',
            'balance_due' => '69.50',
        ]);

        Payment::query()->create([
            'payment_number' => 'REC-2082-00001',
            'direction' => 'received',
            'customer_id' => $customer->id,
            'invoice_id' => $invoice->id,
            'payment_date' => now()->toDateString(),
            'method' => 'cash',
            'reference_number' => 'PMT-100',
            'amount' => '100.00',
        ]);

        $csvResponse = $this->actingAs($user)->get('/reports/payments?export=csv');
        $xlsxResponse = $this->actingAs($user)->get('/reports/payments?export=xlsx');

        $csvResponse->assertOk();
        $csvResponse->assertHeader('content-disposition', 'attachment; filename=deskerp-payment-report.csv');
        $this->assertStringContainsString('REC-2082-00001', $csvResponse->streamedContent());

        $xlsxResponse->assertOk();
        $xlsxResponse->assertHeader('content-disposition', 'attachment; filename=deskerp-payment-report.xlsx');
    }
}
