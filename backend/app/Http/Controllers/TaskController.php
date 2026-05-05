<?php

namespace App\Http\Controllers;

use App\Http\Requests\Task\CreateTaskRequest;
use App\Http\Requests\Task\DelegateTaskRequest;
use App\Http\Requests\Task\ReorderTasksRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function __construct(private readonly TaskService $taskService) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search', 'filter', 'start_date', 'end_date',
            'who', 'delegated_to', 'project_id',
        ]);

        $tasks = $this->taskService->listTasks($request->user()->id, $filters);

        return response()->json(TaskResource::collection($tasks));
    }

    public function store(CreateTaskRequest $request): JsonResponse
    {
        $task = $this->taskService->createTask($request->user()->id, $request->validated());

        return response()->json([
            'message' => 'Tarefa criada com sucesso.',
            'task'    => new TaskResource($task->load('project')),
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $task = $this->taskService->listTasks($request->user()->id)
            ->firstWhere('id', $id);

        if (!$task) {
            return response()->json(['message' => 'Tarefa não encontrada.'], 404);
        }

        return response()->json(new TaskResource($task));
    }

    public function update(UpdateTaskRequest $request, int $id): JsonResponse
    {
        $task = $this->taskService->updateTask($request->user()->id, $id, $request->validated());

        return response()->json([
            'message' => 'Tarefa atualizada com sucesso.',
            'task'    => new TaskResource($task),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->taskService->deleteTask($request->user()->id, $id);

        return response()->json(['message' => 'Tarefa excluída com sucesso.']);
    }

    public function finalize(Request $request, int $id): JsonResponse
    {
        $task = $this->taskService->finalizeTask($request->user()->id, $id);

        return response()->json([
            'message' => 'Tarefa finalizada com sucesso.',
            'task'    => new TaskResource($task),
        ]);
    }

    public function pin(Request $request, int $id): JsonResponse
    {
        $task = $this->taskService->pinTask($request->user()->id, $id);

        return response()->json([
            'message' => $task->is_pinned ? 'Tarefa fixada.' : 'Tarefa desafixada.',
            'task'    => new TaskResource($task),
        ]);
    }

    public function reorder(ReorderTasksRequest $request): JsonResponse
    {
        $this->taskService->reorderTasks($request->user()->id, $request->validated('ids'));

        return response()->json(['message' => 'Ordem atualizada com sucesso.']);
    }

    public function delegate(DelegateTaskRequest $request, int $id): JsonResponse
    {
        $task = $this->taskService->delegateTask(
            $request->user()->id,
            $id,
            $request->validated('delegated_to')
        );

        $shareUrl = config('app.frontend_url', 'http://localhost') . '/share/' . $task->share_token;

        return response()->json([
            'message'   => 'Tarefa delegada com sucesso.',
            'task'      => new TaskResource($task),
            'share_url' => $shareUrl,
            'whatsapp_url' => $this->buildWhatsAppUrl($task->delegated_to, $task->description, $shareUrl),
        ]);
    }

    public function share(string $token): JsonResponse
    {
        $task = $this->taskService->getByShareToken($token);

        if (!$task) {
            return response()->json(['message' => 'Tarefa não encontrada.'], 404);
        }

        return response()->json(new TaskResource($task));
    }

    private function buildWhatsAppUrl(string $name, string $description, string $url): string
    {
        $text = urlencode("Olá {$name}! Você tem uma tarefa delegada: \"{$description}\". Acesse: {$url}");
        return "https://wa.me/?text={$text}";
    }
}
