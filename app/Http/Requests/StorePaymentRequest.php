<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'direction' => ['required', 'in:received,made'],
            'customer_id' => ['nullable', 'exists:customers,id'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'invoice_id' => ['nullable', 'exists:invoices,id'],
            'payment_date' => ['required', 'date'],
            'method' => ['required', 'string', 'max:50'],
            'reference_number' => ['nullable', 'string', 'max:100'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $direction = $this->input('direction');

            if ($direction === 'received' && ! $this->filled('invoice_id') && ! $this->filled('customer_id')) {
                $validator->errors()->add('customer_id', 'Customer is required when no invoice is linked.');
            }

            if ($direction === 'made' && ! $this->filled('supplier_id')) {
                $validator->errors()->add('supplier_id', 'Supplier is required for payments made.');
            }
        });
    }
}
