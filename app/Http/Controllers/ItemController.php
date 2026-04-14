<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreItemRequest;
use App\Http\Requests\UpdateItemRequest;
use App\Models\Category;
use App\Models\Item;
use App\Models\Unit;
use App\Services\InventoryService;
use App\Services\PricingService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    public function __construct(
        private readonly InventoryService $inventoryService,
        private readonly PricingService $pricingService,
    ) {}

    public function index(Request $request): View
    {
        $items = Item::query()
            ->with(['unit', 'category'])
            ->when($request->filled('q'), function ($query) use ($request): void {
                $term = $request->string('q');

                $query->where(function ($inner) use ($term): void {
                    $inner->where('name', 'like', "%{$term}%")
                        ->orWhere('sku', 'like', "%{$term}%");
                });
            })
            ->when($request->filled('category_id'), fn ($query) => $query->where('category_id', $request->integer('category_id')))
            ->when($request->filled('status'), function ($query) use ($request): void {
                $query->where('is_active', $request->string('status') === 'active');
            })
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return view('items.index', [
            'items' => $items,
            'categories' => Category::query()->orderBy('name')->get(),
        ]);
    }

    public function create(): View
    {
        return view('items.create', [
            'item' => new Item([
                'item_type' => 'stockable',
                'is_active' => true,
                'allow_discount' => true,
                'track_inventory' => true,
            ]),
            'units' => Unit::query()->orderBy('name')->get(),
            'categories' => Category::query()->orderBy('name')->get(),
            'openingStock' => '0.000',
            'priceTiers' => [],
        ]);
    }

    public function store(StoreItemRequest $request): RedirectResponse
    {
        $validated = $this->validatedData($request);
        $openingStock = $validated['opening_stock'] ?? 0;
        unset($validated['opening_stock'], $validated['price_tiers']);

        $item = Item::query()->create($validated);
        $this->pricingService->syncPriceTiers($item, $request->input('price_tiers', []));
        $this->inventoryService->syncOpeningStock($item, $openingStock);

        return redirect()
            ->route('items.show', $item)
            ->with('success', 'Item created successfully.');
    }

    public function show(Item $item): View
    {
        $item->load([
            'unit',
            'category',
            'prices',
            'stockMovements' => fn ($query) => $query->latest('movement_date')->limit(20),
        ]);

        $openingStock = $item->stockMovements()
            ->where('movement_type', 'opening')
            ->where('reference_type', 'item')
            ->where('reference_id', $item->id)
            ->value('quantity_change') ?? '0.000';

        return view('items.show', compact('item', 'openingStock'));
    }

    public function edit(Item $item): View
    {
        $item->load('prices');

        $openingStock = $item->stockMovements()
            ->where('movement_type', 'opening')
            ->where('reference_type', 'item')
            ->where('reference_id', $item->id)
            ->value('quantity_change') ?? '0.000';

        return view('items.edit', [
            'item' => $item,
            'units' => Unit::query()->orderBy('name')->get(),
            'categories' => Category::query()->orderBy('name')->get(),
            'openingStock' => $openingStock,
            'priceTiers' => $item->prices,
        ]);
    }

    public function update(UpdateItemRequest $request, Item $item): RedirectResponse
    {
        if ($item->track_inventory && ! $request->boolean('track_inventory', false) && $item->stockMovements()->where('movement_type', '!=', 'opening')->exists()) {
            return back()->withInput()->with('error', 'Inventory tracking cannot be disabled after stock transactions exist.');
        }

        $validated = $this->validatedData($request);
        $openingStock = $validated['opening_stock'] ?? 0;
        unset($validated['opening_stock'], $validated['price_tiers']);

        $item->update($validated);
        $this->pricingService->syncPriceTiers($item, $request->input('price_tiers', []));
        $this->inventoryService->syncOpeningStock($item, $openingStock);

        return redirect()
            ->route('items.show', $item)
            ->with('success', 'Item updated successfully.');
    }

    public function destroy(Item $item): RedirectResponse
    {
        if ($item->invoiceLines()->exists() || $item->stockMovements()->exists()) {
            return back()->with('error', 'Item cannot be deleted once invoices or stock movements exist.');
        }

        $item->delete();

        return redirect()
            ->route('items.index')
            ->with('success', 'Item deleted successfully.');
    }

    private function validatedData(StoreItemRequest|UpdateItemRequest $request): array
    {
        $validated = $request->validated();
        $validated['allow_discount'] = $request->boolean('allow_discount', true);
        $validated['track_inventory'] = $request->boolean('track_inventory', true);
        $validated['is_active'] = $request->boolean('is_active', true);

        return $validated;
    }
}
