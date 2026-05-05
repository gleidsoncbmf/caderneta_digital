<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;

class DelegateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'delegated_to' => ['required', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'delegated_to.required' => 'Informe para quem a tarefa será delegada.',
        ];
    }
}
