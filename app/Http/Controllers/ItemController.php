<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreItemRequest;
use App\Http\Requests\UpdateItemRequest;
use App\Models\Category;
use App\Models\Item;
use App\Models\Unit;
use App\Services\InventoryService;
use App\Services\PricingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ItemController extends Controller
{
    public function __construct(
        private readonly InventoryService $inventoryService,
        private readonly PricingService $pricingService,
    ) {}

    public function index(Request $request): Response
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

        return Inertia::render('Items/Index', [
            'items' => [
                'data' => $items->getCollection()->map(fn (Item $item) => [
                    'id' => $item->id,
                    'sku' => $item->sku,
                    'name' => $item->name,
                    'item_type' => $item->item_type,
                    'unit_name' => $item->unit?->name,
                    'category_name' => $item->category?->name,
                    'selling_price' => $item->selling_price,
                    'current_stock' => $item->current_stock,
                    'is_active' => $item->is_active,
                ]),
                'meta' => $this->paginationMeta($items),
            ],
            'filters' => [
                'q' => $request->string('q')->toString(),
                'category_id' => $request->string('category_id')->toString(),
                'status' => $request->string('status')->toString(),
            ],
            'categories' => Category::query()->orderBy('name')->get(['id', 'name'])->map(fn ($category) => [
                'id' => $category->id,
                'name' => $category->name,
            ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Items/Form', [
            'mode' => 'create',
            'item' => [
                'id' => null,
                'sku' => '',
                'name' => '',
                'item_type' => 'stockable',
                'unit_id' => null,
                'category_id' => null,
                'description' => '',
                'base_price' => '0.00',
                'selling_price' => '0.00',
                'tax_rate' => '0.00',
                'allow_discount' => true,
                'track_inventory' => true,
                'opening_stock' => '0.000',
                'reorder_level' => '0.000',
                'is_active' => true,
                'price_tiers' => [],
            ],
            'units' => $this->unitOptions(),
            'categories' => $this->categoryOptions(),
        ]);
    }

    public function store(StoreItemRequest $request): RedirectResponse|JsonResponse
    {
        $validated = $this->validatedData($request);
        $openingStock = $validated['opening_stock'] ?? 0;
        unset($validated['opening_stock'], $validated['price_tiers']);

        $item = Item::query()->create($validated);
        $this->pricingService->syncPriceTiers($item, $request->input('price_tiers', []));
        $this->inventoryService->syncOpeningStock($item, $openingStock);

        if ($request->expectsJson()) {
            $item->load('unit');

            return response()->json([
                'id' => $item->id,
                'name' => $item->name,
                'sku' => $item->sku,
                'unit' => $item->unit?->code,
                'sellingPrice' => $item->selling_price,
                'taxRate' => $item->tax_rate,
                'trackInventory' => $item->track_inventory,
                'currentStock' => $item->current_stock,
            ]);
        }

        return redirect()
            ->route('items.show', $item)
            ->with('success', 'Item created successfully.');
    }

    public function show(Item $item): Response
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

        return Inertia::render('Items/Show', [
            'item' => [
                'id' => $item->id,
                'sku' => $item->sku,
                'name' => $item->name,
                'item_type' => $item->item_type,
                'description' => $item->description,
                'unit_name' => $item->unit?->name,
                'category_name' => $item->category?->name,
                'base_price' => $item->base_price,
                'selling_price' => $item->selling_price,
                'tax_rate' => $item->tax_rate,
                'allow_discount' => $item->allow_discount,
                'track_inventory' => $item->track_inventory,
                'current_stock' => $item->current_stock,
                'opening_stock' => $openingStock,
                'reorder_level' => $item->reorder_level,
                'is_active' => $item->is_active,
                'price_tiers' => $item->prices->map(fn ($tier) => [
                    'id' => $tier->id,
                    'label' => $tier->label,
                    'amount' => $tier->amount,
                ]),
                'stock_movements' => $item->stockMovements->map(fn ($movement) => [
                    'id' => $movement->id,
                    'movement_date' => optional($movement->movement_date)->format('Y-m-d'),
                    'movement_type' => $movement->movement_type,
                    'quantity_change' => $movement->quantity_change,
                    'reference_number' => $movement->reference_number,
                    'notes' => $movement->notes,
                ]),
            ],
        ]);
    }

    public function edit(Item $item): Response
    {
        $item->load('prices');

        $openingStock = $item->stockMovements()
            ->where('movement_type', 'opening')
            ->where('reference_type', 'item')
            ->where('reference_id', $item->id)
            ->value('quantity_change') ?? '0.000';

        return Inertia::render('Items/Form', [
            'mode' => 'edit',
            'item' => [
                'id' => $item->id,
                'sku' => $item->sku,
                'name' => $item->name,
                'item_type' => $item->item_type,
                'unit_id' => $item->unit_id,
                'category_id' => $item->category_id,
                'description' => $item->description,
                'base_price' => (string) $item->base_price,
                'selling_price' => (string) $item->selling_price,
                'tax_rate' => (string) $item->tax_rate,
                'allow_discount' => $item->allow_discount,
                'track_inventory' => $item->track_inventory,
                'opening_stock' => (string) $openingStock,
                'reorder_level' => (string) $item->reorder_level,
                'is_active' => $item->is_active,
                'price_tiers' => $item->prices->map(fn ($tier) => [
                    'label' => $tier->label,
                    'amount' => (string) $tier->amount,
                ])->values()->all(),
            ],
            'units' => $this->unitOptions(),
            'categories' => $this->categoryOptions(),
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

    private function paginationMeta($paginator): array
    {
        return [
            'currentPage' => $paginator->currentPage(),
            'lastPage' => $paginator->lastPage(),
            'perPage' => $paginator->perPage(),
            'total' => $paginator->total(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
        ];
    }

    private function unitOptions()
    {
        return Unit::query()->orderBy('name')->get(['id', 'name'])->map(fn ($unit) => [
            'id' => $unit->id,
            'name' => $unit->name,
        ]);
    }

    private function categoryOptions()
    {
        return Category::query()->orderBy('name')->get(['id', 'name'])->map(fn ($category) => [
            'id' => $category->id,
            'name' => $category->name,
        ]);
    }
}
