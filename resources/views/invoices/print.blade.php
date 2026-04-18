<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>{{ $invoice->invoice_number }} - DeskERP</title>
        <style>
            body { font-family: DejaVu Sans, sans-serif; color: #0f172a; margin: 24px; }
            .header, .summary { width: 100%; margin-bottom: 24px; }
            .header td, .summary td { vertical-align: top; }
            .muted { color: #64748b; font-size: 12px; }
            .title { font-size: 28px; font-weight: bold; margin-bottom: 6px; }
            .panel { border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; }
            table.items { width: 100%; border-collapse: collapse; margin-top: 20px; }
            table.items th, table.items td { border: 1px solid #cbd5e1; padding: 10px; font-size: 12px; }
            table.items th { background: #f8fafc; text-align: left; }
            .totals { width: 320px; margin-left: auto; margin-top: 24px; border-collapse: collapse; }
            .totals td { padding: 8px 0; font-size: 13px; }
            .totals .grand td { border-top: 1px solid #cbd5e1; font-weight: bold; padding-top: 12px; }
            .right { text-align: right; }
        </style>
    </head>
    <body>
        <table class="header">
            <tr>
                <td>
                    <div class="title">DeskERP Invoice</div>
                    <div class="muted">{{ config('app.name', 'DeskERP') }}</div>
                </td>
                <td class="right">
                    <div><strong>{{ $invoice->invoice_number }}</strong></div>
                    <div class="muted">Issue Date: {{ $invoice->issue_date?->format('d M Y') }}</div>
                    <div class="muted">Due Date: {{ $invoice->due_date?->format('d M Y') ?: 'N/A' }}</div>
                </td>
            </tr>
        </table>

        <table class="summary">
            <tr>
                <td width="52%">
                    <div class="panel">
                        <div class="muted">Bill To</div>
                        <div><strong>{{ $invoice->customer_name }}</strong></div>
                        <div>{{ $invoice->billing_address ?: 'No billing address' }}</div>
                        <div>{{ $invoice->tax_number ?: '' }}</div>
                    </div>
                </td>
                <td width="4%"></td>
                <td width="44%">
                    <div class="panel">
                        <div class="muted">Status</div>
                        <div>{{ ucfirst($invoice->status) }} / {{ ucfirst($invoice->payment_status) }}</div>
                        <div class="muted" style="margin-top: 10px;">Reference</div>
                        <div>{{ $invoice->reference_number ?: 'N/A' }}</div>
                    </div>
                </td>
            </tr>
        </table>

        <table class="items">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Unit</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Disc %</th>
                    <th>Tax %</th>
                    <th class="right">Line Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($invoice->lines as $line)
                    <tr>
                        <td>{{ $line->description }}</td>
                        <td>{{ $line->unit_name ?: ($line->item?->unit?->code ?? 'N/A') }}</td>
                        <td>{{ number_format((float) $line->quantity, 3) }}</td>
                        <td>{{ number_format((float) $line->rate, 2) }}</td>
                        <td>{{ number_format((float) $line->discount_percent, 2) }}</td>
                        <td>{{ number_format((float) $line->tax_percent, 2) }}</td>
                        <td class="right">{{ number_format((float) $line->total, 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <table class="totals">
            <tr>
                <td>Subtotal</td>
                <td class="right">{{ number_format((float) $invoice->subtotal, 2) }}</td>
            </tr>
            <tr>
                <td>Discount</td>
                <td class="right">{{ number_format((float) $invoice->discount_total, 2) }}</td>
            </tr>
            <tr>
                <td>Tax</td>
                <td class="right">{{ number_format((float) $invoice->tax_total, 2) }}</td>
            </tr>
            <tr class="grand">
                <td>Total</td>
                <td class="right">{{ number_format((float) $invoice->total, 2) }}</td>
            </tr>
            <tr>
                <td>Paid</td>
                <td class="right">{{ number_format((float) $invoice->paid_total, 2) }}</td>
            </tr>
            <tr>
                <td>Balance Due</td>
                <td class="right">{{ number_format((float) $invoice->balance_due, 2) }}</td>
            </tr>
        </table>

        @if ($invoice->notes)
            <div style="margin-top: 24px;">
                <div class="muted">Notes</div>
                <div>{{ $invoice->notes }}</div>
            </div>
        @endif
    </body>
</html>
