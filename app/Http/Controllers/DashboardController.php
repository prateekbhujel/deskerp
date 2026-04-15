<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Item;
use App\Models\Payment;
use App\Models\Supplier;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $currentMonth = now()->startOfMonth();

        return Inertia::render('Dashboard', [
            'stats' => [
                'customers' => Customer::query()->count(),
                'suppliers' => Supplier::query()->count(),
                'items' => Item::query()->count(),
                'sales_this_month' => Invoice::query()
                    ->where('status', 'final')
                    ->whereDate('issue_date', '>=', $currentMonth)
                    ->sum('total'),
                'outstanding' => Invoice::query()
                    ->where('status', 'final')
                    ->sum('balance_due'),
            ],
            'recentInvoices' => Invoice::query()
                ->with('customer')
                ->latest('issue_date')
                ->limit(8)
                ->get(),
            'recentPayments' => Payment::query()
                ->with(['customer', 'supplier', 'invoice'])
                ->latest('payment_date')
                ->limit(8)
                ->get(),
            'lowStockItems' => Item::query()
                ->where('track_inventory', true)
                ->whereColumn('current_stock', '<=', 'reorder_level')
                ->where('reorder_level', '>', 0)
                ->orderBy('current_stock')
                ->limit(8)
                ->get(),
        ])->withViewData([
            'title' => 'Dashboard',
        ]);
    }
}
