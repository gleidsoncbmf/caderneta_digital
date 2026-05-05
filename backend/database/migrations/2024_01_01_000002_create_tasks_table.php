<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $table->text('description');
            $table->string('who', 255)->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->enum('status', ['active', 'finalized', 'deleted'])->default('active');
            $table->integer('priority')->default(0)->index();
            $table->boolean('is_pinned')->default(false);
            $table->string('delegated_to', 255)->nullable();
            $table->uuid('share_token')->unique();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status', 'priority']);
            $table->index(['user_id', 'end_date']);
            $table->index('share_token');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
