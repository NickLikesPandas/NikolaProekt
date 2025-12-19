<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateImageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
{
    return true; // <--- CHANGE THIS FROM FALSE TO TRUE
}

public function rules(): array
{
    return [
        
        'title' => 'sometimes|string|max:255',
        'src'   => 'sometimes|string',
    ];
}
}