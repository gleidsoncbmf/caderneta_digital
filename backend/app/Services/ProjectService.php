<?php

namespace App\Services;

use App\DTOs\CreateProjectDTO;
use App\Interfaces\ProjectRepositoryInterface;
use App\Models\Project;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Collection;

class ProjectService
{
    public function __construct(
        private readonly ProjectRepositoryInterface $projectRepository,
    ) {}

    public function listProjects(int $userId, ?string $search = null): Collection
    {
        return $this->projectRepository->getAllForUser($userId, $search);
    }

    public function createProject(int $userId, array $data): Project
    {
        $dto = CreateProjectDTO::fromArray($data, $userId);

        return $this->projectRepository->create($dto);
    }

    public function updateProject(int $userId, int $projectId, array $data): Project
    {
        $project = $this->findAndAuthorize($userId, $projectId);

        return $this->projectRepository->update($project, $data['name'], $data['color'] ?? null);
    }

    public function deleteProject(int $userId, int $projectId): void
    {
        $project = $this->findAndAuthorize($userId, $projectId);

        $this->projectRepository->delete($project);
    }

    private function findAndAuthorize(int $userId, int $projectId): Project
    {
        $project = $this->projectRepository->findById($projectId);

        if (!$project || $project->user_id !== $userId) {
            throw new AuthorizationException('Project not found or access denied.');
        }

        return $project;
    }
}
