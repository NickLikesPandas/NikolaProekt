<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreImageRequest;
use App\Http\Requests\UpdateImageRequest;
use App\Models\Image;
use Illuminate\Http\Request;

class ImageController extends Controller
{
    /**
     * Display a listing of the images.
     */
    public function index()
    {
        $images = Image::all();
        return response()->json($images);
    }

    /**
     * Store a newly created image in storage.
     */
    public function store(StoreImageRequest $request)
    {
        $image = Image::create($request->validated());
        return response()->json($image, 201);
    }

    /**
     * Display the specified image.
     */
    public function show(Image $image)
    {
        return response()->json($image);
    }

    /**
     * Update the specified image in storage.
     */
    public function update(UpdateImageRequest $request, Image $image)
    {
        $image->update($request->validated());
        return response()->json($image);
    }

    /**
     * Remove the specified image from storage.
     */
    public function destroy(Image $image)
    {
        $image->delete();
        return response()->json(null, 204);
    }
}