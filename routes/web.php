<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\ImageController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard Route
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Image Routes
    Route::prefix('images')->group(function () {
        // Serve the React Page
        Route::get('/', function () {
            return Inertia::render('images'); // This will load the `images.tsx` page
        })->name('images.view');

        // API Endpoints
        Route::get('/images', [ImageController::class, 'index'])->name('images.index'); // Fetch all images
        Route::post('/images', [ImageController::class, 'store'])->name('images.store'); // Add a new image
        Route::post('/images/{id}', [ImageController::class, 'update'])->name('images.update'); // Update an image
        Route::delete('/images/{id}', [ImageController::class, 'destroy'])->name('images.destroy'); // Delete an image
    });
});

require __DIR__.'/settings.php';


