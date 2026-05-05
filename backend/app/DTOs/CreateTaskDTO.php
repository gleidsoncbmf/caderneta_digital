<?php

namespace App\DTOs;

class CreateTaskDTO
{
    public function __construct(
        public readonly int $userId,
        public readonly string $description,
        public readonly ?int $projectId = null,
        public readonly ?string $who = null,
        public readonly ?string $startDate = null,
        public readonly ?string $endDate = null,
        public readonly ?string $delegatedTo = null,
        public readonly int $priority = 0,
    ) {}

    public static function fromArray(array $data, int $userId, int $priority): self
    {
        return new self(
            userId: $userId,
            description: $data['description'],
            projectId: $data['project_id'] ?? null,
            who: $data['who'] ?? null,
            startDate: $data['start_date'] ?? null,
            endDate: $data['end_date'] ?? null,
            delegatedTo: $data['delegated_to'] ?? null,
            priority: $priority,
        );
    }
}
