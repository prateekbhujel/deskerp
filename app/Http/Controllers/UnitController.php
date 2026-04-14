<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUnitRequest;
use App\Http\Requests\UpdateUnitRequest;
use App\Models\Unit;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    public function index(Request $request): View
    {
        $units = Unit::query()
            ->when($request->filled('q'), function ($query) use ($request): void {
                $term = $request->string('q');
                $query->where('name', 'like', "%{$term}%")
                    ->orWhere('code', 'like', "%{$term}%");
            })
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return view('units.index', compact('units'));
    }

    public function create(): View
    {
        return view('units.create', [
            'unit' => new Unit(['is_active' => true]),
        ]);
    }

    public function store(StoreUnitRequest $request): RedirectResponse
    {
        $unit = Unit::query()->create([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()
            ->route('units.index')
            ->with('success', 'Unit created successfully.');
    }

    public function show(Unit $unit): View
    {
        $unit->loadCount('items');

        return view('units.show', compact('unit'));
    }

    public function edit(Unit $unit): View
    {
        return view('units.edit', compact('unit'));
    }

    public function update(UpdateUnitRequest $request, Unit $unit): RedirectResponse
    {
        $unit->update([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()
            ->route('units.show', $unit)
            ->with('success', 'Unit updated successfully.');
    }

    public function destroy(Unit $unit): RedirectResponse
    {
        if ($unit->items()->exists()) {
            return back()->with('error', 'Unit cannot be deleted while items use it.');
        }

        $unit->delete();

        return redirect()
            ->route('units.index')
            ->with('success', 'Unit deleted successfully.');
    }
}
