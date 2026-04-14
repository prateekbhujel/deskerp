<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <div>
        <label class="dp-label" for="direction">Direction</label>
        <select class="dp-select" id="direction" name="direction" required>
            <option value="received" @selected(old('direction', $payment->direction) === 'received')>Payment Received</option>
            <option value="made" @selected(old('direction', $payment->direction) === 'made')>Payment Made</option>
        </select>
    </div>
    <div>
        <label class="dp-label" for="payment_date">Payment Date</label>
        <input class="dp-input" id="payment_date" type="date" name="payment_date" value="{{ old('payment_date', optional($payment->payment_date)->format('Y-m-d') ?? $payment->payment_date ?? now()->toDateString()) }}" required>
    </div>
    <div>
        <label class="dp-label" for="method">Payment Method</label>
        <select class="dp-select" id="method" name="method" required>
            @foreach (['cash', 'bank', 'card', 'cheque', 'upi', 'other'] as $method)
                <option value="{{ $method }}" @selected(old('method', $payment->method) === $method)>{{ ucfirst($method) }}</option>
            @endforeach
        </select>
    </div>
    <div>
        <label class="dp-label" for="amount">Amount</label>
        <input class="dp-input" id="amount" type="number" min="0" step="0.01" name="amount" value="{{ old('amount', $payment->amount ?? 0) }}" required>
    </div>
    <div class="xl:col-span-2">
        <label class="dp-label" for="invoice_id">Linked Invoice</label>
        <select class="dp-select" id="invoice_id" name="invoice_id">
            <option value="">No linked invoice</option>
            @foreach ($openInvoices as $invoiceOption)
                <option value="{{ $invoiceOption->id }}" @selected((string) old('invoice_id', $payment->invoice_id) === (string) $invoiceOption->id)>
                    {{ $invoiceOption->invoice_number }} / {{ $invoiceOption->customer_name }} / Balance {{ number_format((float) $invoiceOption->balance_due, 2) }}
                </option>
            @endforeach
        </select>
        <p class="mt-1 text-xs text-slate-500">For receipts linked to an invoice, the customer will be derived automatically.</p>
    </div>
    <div class="xl:col-span-2">
        <label class="dp-label" for="customer_id">Customer</label>
        <select class="dp-select" id="customer_id" name="customer_id">
            <option value="">No customer</option>
            @foreach ($customers as $customer)
                <option value="{{ $customer->id }}" @selected((string) old('customer_id', $payment->customer_id) === (string) $customer->id)>{{ $customer->name }}</option>
            @endforeach
        </select>
    </div>
    <div class="xl:col-span-2">
        <label class="dp-label" for="supplier_id">Supplier</label>
        <select class="dp-select" id="supplier_id" name="supplier_id">
            <option value="">No supplier</option>
            @foreach ($suppliers as $supplier)
                <option value="{{ $supplier->id }}" @selected((string) old('supplier_id', $payment->supplier_id) === (string) $supplier->id)>{{ $supplier->name }}</option>
            @endforeach
        </select>
    </div>
    <div class="xl:col-span-2">
        <label class="dp-label" for="reference_number">Reference Number</label>
        <input class="dp-input" id="reference_number" name="reference_number" value="{{ old('reference_number', $payment->reference_number) }}">
    </div>
</div>

<div class="mt-6">
    <label class="dp-label" for="notes">Notes</label>
    <textarea class="dp-textarea" id="notes" name="notes" rows="4">{{ old('notes', $payment->notes) }}</textarea>
</div>

<div class="mt-6 flex flex-wrap gap-3">
    <button type="submit" class="dp-btn-primary">{{ $submitLabel }}</button>
    <a href="{{ $cancelUrl }}" class="dp-btn">Cancel</a>
</div>
