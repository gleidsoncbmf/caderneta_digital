<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;

class CreateTaskRequest extends FormRequest
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

    public function messages(): array
    {
        return [
            'description.required' => 'A descrição da tarefa é obrigatória.',
            'description.max'      => 'A descrição não pode ter mais de 1000 caracteres.',
            'project_id.exists'    => 'Projeto não encontrado.',
            'end_date.after_or_equal' => 'A data fim deve ser igual ou posterior à data início.',
        ];
    }
}
