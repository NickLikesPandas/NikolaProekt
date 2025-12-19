<?php
namespace App\Http\Controllers;

use App\Models\Image;
use App\Http\Requests\StoreImageRequest;

class ImageController extends Controller
{
    public function store(StoreImageRequest $request)
    {
        try {
            // Save the file to the storage
            $filePath = $request->file('file')->store('images', 'public');
    
            // Save the data to the database
            $image = Image::create([
                'id' => auth()->id(),
                'title' => $request->title,
                'file_name' => $request->file('file')->getClientOriginalName(),
                'file_url' => "/storage/{$filePath}",
            ]);
    
            return response()->json(['message' => 'Image uploaded successfully', 'image' => $image], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to upload image', 'error' => $e->getMessage()], 500);
        }
    }

    // New function to return a list of images
    public function index()
    {
        $images = Image::where('user_id', auth()->id()) // Fetch images for the logged-in user
        ->select('id', 'title', 'file_name', 'file_url')
        ->get();

        // Format the response
    $formattedImages = $images->map(function ($image) {
        return [
            'id' => $image->id,
            'title' => $image->title,
            'fileName' => $image->file_name, // Use camelCase for consistency with frontend
            'fileUrl' => $image->file_url,
        ];
    });
        
    return response()->json(['images' => $formattedImages], 200);
    }

    public function destroy($id)
    {
        try {
            // Find the image by ID
            $image = Image::findOrFail($id);

            // Delete the image file from the storage folder
            $filePath = public_path($image->file_url); // Get the full path to the file
            if (file_exists($filePath)) {
                unlink($filePath); // Delete the file
            }

        // Delete the record from the database
        $image->delete();

        return response()->json(['message' => 'Image deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete image', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(StoreImageRequest $request, $id)
    {
         try {
            // Find the image by ID
            $image = Image::findOrFail($id);

            // Update the title
            $image->title = $request->title;

            // If a new file is uploaded, delete the old file and save the new one
            if ($request->hasFile('file')) {
                // Delete the old file
                $oldFilePath = public_path($image->file_url);
                if (file_exists($oldFilePath)) {
                    unlink($oldFilePath);
                }

                // Save the new file
                $filePath = $request->file('file')->store('images', 'public');
                $image->file_name = $request->file('file')->getClientOriginalName();
                $image->file_url = "/storage/{$filePath}";
            }

            // Save the updated image details
            $image->save();

            return response()->json(['message' => 'Image updated successfully', 'image' => $image], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update image', 'error' => $e->getMessage()], 500);
        }
    }
}