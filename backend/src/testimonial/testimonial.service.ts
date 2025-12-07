import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Testimonial, TestimonialDocument } from './testimonial.schema';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';

@Injectable()
export class TestimonialService {
  constructor(
    @InjectModel(Testimonial.name) private testimonialModel: Model<TestimonialDocument>,
  ) {}

  async create(createDto: CreateTestimonialDto, userId: string): Promise<Testimonial> {
    try {
      const testimonial = new this.testimonialModel({
        ...createDto,
        createdBy: new Types.ObjectId(userId),
      });
      return await testimonial.save();
    } catch (error) {
      throw new BadRequestException('Failed to create testimonial');
    }
  }

  async findAll(page: number = 1, limit: number = 50): Promise<{ data: Testimonial[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.testimonialModel.find({ active: true }).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.testimonialModel.countDocuments({ active: true }),
    ]);
    return { data, total };
  }

  async findById(id: string): Promise<Testimonial> {
    try {
      const testimonial = await this.testimonialModel.findById(id);
      if (!testimonial) {
        throw new NotFoundException('Testimonial not found');
      }
      return testimonial;
    } catch (error) {
      throw new NotFoundException('Testimonial not found');
    }
  }

  async update(id: string, updateDto: UpdateTestimonialDto): Promise<Testimonial> {
    try {
      const testimonial = await this.testimonialModel.findByIdAndUpdate(id, updateDto, { new: true });
      if (!testimonial) {
        throw new NotFoundException('Testimonial not found');
      }
      return testimonial;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to update testimonial');
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      const result = await this.testimonialModel.findByIdAndUpdate(id, { active: false }, { new: true });
      if (!result) {
        throw new NotFoundException('Testimonial not found');
      }
      return { message: 'Testimonial deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to delete testimonial');
    }
  }

  async getRandomTestimonials(count: number = 3): Promise<Testimonial[]> {
    return this.testimonialModel.aggregate([
      { $match: { active: true } },
      { $sample: { size: Math.min(count, await this.testimonialModel.countDocuments({ active: true })) } },
    ]);
  }
}
