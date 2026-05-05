<?php

namespace App\Http\Controllers;

use App\Http\Requests\Project\CreateProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function __construct(private readonly ProjectService $projectService) {}

    public function index(Request $request): JsonResponse
    {
        $projects = $this->projectService->listProjects(
            $request->user()->id,
            $request->query('search')
        );

        return response()->json(ProjectResource::collection($projects));
    }

    public function store(CreateProjectRequest $request): JsonResponse
    {
        $project = $this->projectService->createProject($request->user()->id, $request->validated());

        return response()->json([
            'message' => 'Projeto criado com sucesso.',
            'project' => new ProjectResource($project),
        ], 201);
    }

    public function update(UpdateProjectRequest $request, int $id): JsonResponse
    {
        $project = $this->projectService->updateProject($request->user()->id, $id, $request->validated());

        return response()->json([
            'message' => 'Projeto atualizado com sucesso.',
            'project' => new ProjectResource($project),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->projectService->deleteProject($request->user()->id, $id);

        return response()->json(['message' => 'Projeto excluído com sucesso.']);
    }
}
