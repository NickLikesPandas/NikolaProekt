<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreImageRequest;
use App\Http\Requests\UpdateImageRequest;
use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageController extends Controller
{
    public function index()
    {
        // Filter images by the logged-in user, similar to your NoteController
        $images = Image::where('user_id', auth()->id())->get();
        return response()->json(['images' => $images]);
    }

    public function store(StoreImageRequest $request)
    {
        $data = $request->validated();

        // 1. Process the image file (Base64)
        $data = $this->saveImageFromBase64($data);

        // 2. Create image associated with the authenticated user
        Image::create(array_merge($data, ['user_id' => auth()->id()]));

        // 3. Return success message AND the fresh list of images (matching your NoteController pattern)
        return response()->json([
            'message' => 'Image created successfully!',
            'images' => Image::where('user_id', auth()->id())->get()
        ], 201);
    }

    public function update(UpdateImageRequest $request, $id)
    {
        $validated = $request->validated();

        $image = Image::findOrFail($id);

        // Process image file if a new one was uploaded
        $validated = $this->saveImageFromBase64($validated);

        $image->update($validated);

        return response()->json(['message' => 'Image updated successfully!']);
    }

    public function destroy($id)
    {
        $image = Image::findOrFail($id);
        
        // Optional: Delete the actual file from storage to save space
        // if ($image->src && strpos($image->src, '/storage/') === 0) { ... }

        $image->delete();

        return response()->json(['message' => 'Image deleted successfully!'], 200);
    }

    /**
     * Helper to detect Base64 strings and save them as files.
     * (Kept from previous version to ensure uploads work)
     */
    private function saveImageFromBase64(array $data)
    {
        if (isset($data['src']) && preg_match('/^data:image\/(\w+);base64,/', $data['src'], $type)) {
            $extension = strtolower($type[1]);
            if ($extension === 'jpeg') { $extension = 'jpg'; }

            $base64Data = substr($data['src'], strpos($data['src'], ',') + 1);
            $base64Data = base64_decode($base64Data);

            $fileName = 'images/' . Str::random(16) . '.' . $extension;

            Storage::disk('public')->put($fileName, $base64Data);

            $data['src'] = '/storage/' . $fileName;
        }

        return $data;
    }
}