<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'description'  => ['required', 'string', 'max:1000'],
            'project_id'   => ['nullable', 'integer', 'exists:projects,id'],
            'who'          => ['nullable', 'string', 'max:255'],
            'start_date'   => ['nullable', 'date'],
            'end_date'     => ['nullable', 'date', 'after_or_equal:start_date'],
            'delegated_to' => ['nullable', 'string', 'max:255'],
        ];
    }
}
