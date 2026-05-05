<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'description'  => $this->description,
            'who'          => $this->who,
            'start_date'   => $this->start_date?->format('Y-m-d'),
            'end_date'     => $this->end_date?->format('Y-m-d'),
            'status'       => $this->status,
            'priority'     => $this->priority,
            'is_pinned'    => $this->is_pinned,
            'delegated_to' => $this->delegated_to,
            'share_token'  => $this->share_token,
            'project'      => $this->whenLoaded('project', fn() => new ProjectResource($this->project)),
            'project_id'   => $this->project_id,
            'is_overdue'   => $this->end_date
                ? $this->end_date->isPast() && $this->status === 'active'
                : false,
            'created_at'   => $this->created_at?->toISOString(),
            'updated_at'   => $this->updated_at?->toISOString(),
        ];
    }
}
