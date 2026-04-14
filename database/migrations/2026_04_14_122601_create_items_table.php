<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('unit_id')->constrained()->restrictOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('sku')->nullable()->unique();
            $table->string('name')->index();
            $table->string('item_type')->default('stockable')->index();
            $table->text('description')->nullable();
            $table->decimal('base_price', 14, 2)->default(0);
            $table->decimal('selling_price', 14, 2)->default(0);
            $table->decimal('tax_rate', 8, 2)->default(0);
            $table->boolean('allow_discount')->default(true);
            $table->boolean('track_inventory')->default(true)->index();
            $table->decimal('current_stock', 14, 3)->default(0);
            $table->decimal('reorder_level', 14, 3)->default(0);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
