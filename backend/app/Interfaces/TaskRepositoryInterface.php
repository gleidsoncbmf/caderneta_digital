<?php

namespace App\Interfaces;

use App\DTOs\CreateTaskDTO;
use App\DTOs\UpdateTaskDTO;
use App\Models\Task;
use Illuminate\Support\Collection;

interface TaskRepositoryInterface
{
    public function getAllForUser(int $userId, array $filters = []): Collection;

    public function findById(int $id): ?Task;

    public function findByShareToken(string $token): ?Task;

    public function create(CreateTaskDTO $dto): Task;

    public function update(Task $task, UpdateTaskDTO $dto): Task;

    public function softDelete(Task $task): void;

    public function finalize(Task $task): void;

    public function pin(Task $task): void;

    public function reorder(int $userId, array $orderedIds): void;

    public function getNextPriority(int $userId): int;
}
