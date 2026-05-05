<?php

namespace App\Repositories;

use App\DTOs\CreateTaskDTO;
use App\DTOs\UpdateTaskDTO;
use App\Interfaces\TaskRepositoryInterface;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class TaskRepository implements TaskRepositoryInterface
{
    public function getAllForUser(int $userId, array $filters = []): Collection
    {
        $query = Task::with('project')
            ->where('user_id', $userId)
            ->where('status', '!=', Task::STATUS_DELETED);

        $this->applyFilters($query, $filters);

        return $query->byPriority()->get();
    }

    private function applyFilters($query, array $filters): void
    {
        if (!empty($filters['search'])) {
            $query->where('description', 'like', '%' . $filters['search'] . '%');
        }

        if (!empty($filters['filter'])) {
            switch ($filters['filter']) {
                case 'today':
                    $query->whereBetween('created_at', [
                        Carbon::today()->startOfDay(),
                        Carbon::today()->endOfDay(),
                    ])->where('status', Task::STATUS_ACTIVE);
                    break;
                case 'overdue':
                    $query->where('end_date', '<', Carbon::today())
                          ->where('status', Task::STATUS_ACTIVE);
                    break;
                case 'finalized':
                    $query->where('status', Task::STATUS_FINALIZED);
                    break;
                case 'delegated':
                    $query->whereNotNull('delegated_to');
                    break;
            }
        }

        if (!empty($filters['start_date'])) {
            $query->whereDate('start_date', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->whereDate('end_date', '<=', $filters['end_date']);
        }

        if (!empty($filters['who'])) {
            $query->where('who', 'like', '%' . $filters['who'] . '%');
        }

        if (!empty($filters['delegated_to'])) {
            $query->where('delegated_to', 'like', '%' . $filters['delegated_to'] . '%');
        }

        if (!empty($filters['project_id'])) {
            $query->where('project_id', $filters['project_id']);
        }
    }

    public function findById(int $id): ?Task
    {
        return Task::with('project')->find($id);
    }

    public function findByShareToken(string $token): ?Task
    {
        return Task::with(['project', 'user'])->where('share_token', $token)->first();
    }

    public function create(CreateTaskDTO $dto): Task
    {
        return Task::create([
            'user_id'      => $dto->userId,
            'project_id'   => $dto->projectId,
            'description'  => $dto->description,
            'who'          => $dto->who,
            'start_date'   => $dto->startDate,
            'end_date'     => $dto->endDate,
            'delegated_to' => $dto->delegatedTo,
            'priority'     => $dto->priority,
            'status'       => Task::STATUS_ACTIVE,
            'is_pinned'    => false,
        ]);
    }

    public function update(Task $task, UpdateTaskDTO $dto): Task
    {
        $task->update([
            'description'  => $dto->description,
            'project_id'   => $dto->projectId,
            'who'          => $dto->who,
            'start_date'   => $dto->startDate,
            'end_date'     => $dto->endDate,
            'delegated_to' => $dto->delegatedTo,
        ]);

        return $task->fresh('project');
    }

    public function softDelete(Task $task): void
    {
        $task->update(['status' => Task::STATUS_DELETED]);
        $task->delete();
    }

    public function finalize(Task $task): void
    {
        $task->update(['status' => Task::STATUS_FINALIZED]);
    }

    public function pin(Task $task): void
    {
        $task->update(['is_pinned' => !$task->is_pinned]);
    }

    public function reorder(int $userId, array $orderedIds): void
    {
        DB::transaction(function () use ($userId, $orderedIds) {
            foreach ($orderedIds as $index => $taskId) {
                Task::where('id', $taskId)
                    ->where('user_id', $userId)
                    ->update(['priority' => $index]);
            }
        });
    }

    public function getNextPriority(int $userId): int
    {
        $min = Task::where('user_id', $userId)
            ->where('status', Task::STATUS_ACTIVE)
            ->min('priority');

        return ($min ?? 0) - 1;
    }
}
