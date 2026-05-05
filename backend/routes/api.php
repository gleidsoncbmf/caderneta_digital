<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Caderneta Digital
|--------------------------------------------------------------------------
*/

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// Shared task (public access, limited info)
Route::get('/tasks/share/{token}', [TaskController::class, 'share']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',     [AuthController::class, 'me']);
    });

    // Tasks
    Route::prefix('tasks')->group(function () {
        Route::get('/',              [TaskController::class, 'index']);
        Route::post('/',             [TaskController::class, 'store']);
        Route::get('/{id}',          [TaskController::class, 'show']);
        Route::put('/{id}',          [TaskController::class, 'update']);
        Route::delete('/{id}',       [TaskController::class, 'destroy']);
        Route::post('/{id}/finalize', [TaskController::class, 'finalize']);
        Route::post('/{id}/pin',      [TaskController::class, 'pin']);
        Route::post('/{id}/delegate', [TaskController::class, 'delegate']);
        Route::post('/reorder',       [TaskController::class, 'reorder']);
    });

    // Projects
    Route::apiResource('projects', ProjectController::class)->except(['show']);
});
