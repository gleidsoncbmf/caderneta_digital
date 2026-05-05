<?php

namespace App\Services;

use App\DTOs\CreateTaskDTO;
use App\DTOs\UpdateTaskDTO;
use App\Interfaces\TaskRepositoryInterface;
use App\Models\Task;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Collection;

class TaskService
{
    public function __construct(
        private readonly TaskRepositoryInterface $taskRepository,
    ) {}

    public function listTasks(int $userId, array $filters = []): Collection
    {
        return $this->taskRepository->getAllForUser($userId, $filters);
    }

    public function createTask(int $userId, array $data): Task
    {
        $priority = $this->taskRepository->getNextPriority($userId);

        $dto = CreateTaskDTO::fromArray($data, $userId, $priority);

        return $this->taskRepository->create($dto);
    }

    public function updateTask(int $userId, int $taskId, array $data): Task
    {
        $task = $this->findAndAuthorize($userId, $taskId);

        $dto = UpdateTaskDTO::fromArray($data);

        return $this->taskRepository->update($task, $dto);
    }

    public function deleteTask(int $userId, int $taskId): void
    {
        $task = $this->findAndAuthorize($userId, $taskId);

        $this->taskRepository->softDelete($task);
    }

    public function finalizeTask(int $userId, int $taskId): Task
    {
        $task = $this->findAndAuthorize($userId, $taskId);

        $this->taskRepository->finalize($task);

        return $task->fresh();
    }

    public function pinTask(int $userId, int $taskId): Task
    {
        $task = $this->findAndAuthorize($userId, $taskId);

        $this->taskRepository->pin($task);

        return $task->fresh();
    }

    public function reorderTasks(int $userId, array $orderedIds): void
    {
        $this->taskRepository->reorder($userId, $orderedIds);
    }

    public function getByShareToken(string $token): ?Task
    {
        return $this->taskRepository->findByShareToken($token);
    }

    public function delegateTask(int $userId, int $taskId, string $delegatedTo): Task
    {
        $task = $this->findAndAuthorize($userId, $taskId);

        $task->update(['delegated_to' => $delegatedTo]);

        return $task->fresh();
    }

    private function findAndAuthorize(int $userId, int $taskId): Task
    {
        $task = $this->taskRepository->findById($taskId);

        if (!$task || $task->user_id !== $userId) {
            throw new AuthorizationException('Task not found or access denied.');
        }

        return $task;
    }
}
