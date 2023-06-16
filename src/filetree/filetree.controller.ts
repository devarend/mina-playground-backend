import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { FileTree } from './schemas/filetree.schema';
import { FileTreeService } from './filetree.service';
import { UpdateFileTreeDTO } from './dto/update-filetree.dto';

@Controller('fileTree')
export class FileTreeController {
  constructor(private readonly fileTreeService: FileTreeService) {}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FileTree> {
    return this.fileTreeService.findOne(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.fileTreeService.delete(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFileTreeDTO: UpdateFileTreeDTO,
  ) {
    return this.fileTreeService.update(id, updateFileTreeDTO);
  }
}
