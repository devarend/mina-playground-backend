import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Project } from './schemas/project.schema';
import { CreateProjectDTO } from './dto/create-project.dto';
import { ProjectService } from './project.service';
import { FileTreeService } from '../filetree/filetree.service';
import { UpdateProjectDTO } from './dto/update-project.dto';
import { smartContractTemplate } from '../templates/smartContract';

@Controller('project')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly fileTreeService: FileTreeService,
  ) {}

  @Post()
  async create(@Body() createProjectDTO: CreateProjectDTO) {
    const item = await this.projectService.create(createProjectDTO);
    const forkedProject = createProjectDTO.forkedProject;

    if (forkedProject) {
      const fileSystemTree = await this.fileTreeService.findOne(forkedProject);
      await this.fileTreeService.create({
        project_id: item._id,
        fileSystemTree: fileSystemTree.fileSystemTree,
      });
      return { project_id: item._id };
    }

    await this.fileTreeService.create({
      project_id: item._id,
      fileSystemTree: smartContractTemplate,
    });
    return { project_id: item._id };
  }

  // @Get()
  // async findAll(): Promise<Project[]> {
  //   return this.projectService.findAll();
  // }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Project> {
    return this.projectService.findOne(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.projectService.delete(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProjectDTO: UpdateProjectDTO,
  ) {
    return this.projectService.update(id, updateProjectDTO);
  }
}
