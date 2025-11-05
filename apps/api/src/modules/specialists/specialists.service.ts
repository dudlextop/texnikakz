import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  Media,
  Prisma,
  Specialist,
  SpecialistAvailability,
  UserRole
} from '@prisma/client';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { PrismaService } from '../database/prisma.service';
import { CreateSpecialistDto } from './dto/create-specialist.dto';
import { SpecialistDto } from './dto/specialist.dto';
import { SpecialistListResponseDto } from './dto/specialist-list-response.dto';
import { SpecialistQueryDto, SpecialistSortOption } from './dto/specialist-query.dto';
import { UpdateSpecialistDto } from './dto/update-specialist.dto';

@Injectable()
export class SpecialistsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSpecialistDto, user: AuthenticatedUser): Promise<SpecialistDto> {
    const specialist = await this.prisma.specialist.create({
      data: {
        userId: user.id,
        categoryId: dto.categoryId,
        profession: dto.profession,
        title: dto.title,
        bio: dto.bio ?? null,
        phone: dto.phone ?? null,
        experienceYears: dto.experienceYears,
        rateHourly: dto.rateHourly !== undefined ? new Prisma.Decimal(dto.rateHourly) : null,
        rateShift: dto.rateShift !== undefined ? new Prisma.Decimal(dto.rateShift) : null,
        rateMonthly: dto.rateMonthly !== undefined ? new Prisma.Decimal(dto.rateMonthly) : null,
        availability: dto.availability ?? SpecialistAvailability.FULL_TIME,
        hasOwnEquipment: dto.hasOwnEquipment,
        certifications: dto.certifications ?? null,
        regionsServed: dto.regionsServed ?? null,
        skills: dto.skills,
        languages: dto.languages ?? [],
        regionId: dto.regionId ?? null,
        cityId: dto.cityId ?? null
      },
      include: { portfolio: true }
    });
    return this.toDto(specialist);
  }

  async update(id: string, dto: UpdateSpecialistDto, user: AuthenticatedUser): Promise<SpecialistDto> {
    const specialist = await this.findByIdOrThrow(id);
    this.ensureCanMutate(specialist, user);
    const updated = await this.prisma.specialist.update({
      where: { id: specialist.id },
      data: {
        categoryId: dto.categoryId ?? specialist.categoryId,
        profession: dto.profession ?? specialist.profession,
        title: dto.title ?? specialist.title,
        bio: dto.bio ?? specialist.bio,
        phone: dto.phone ?? specialist.phone,
        experienceYears: dto.experienceYears ?? specialist.experienceYears,
        rateHourly: dto.rateHourly !== undefined ? new Prisma.Decimal(dto.rateHourly) : specialist.rateHourly,
        rateShift: dto.rateShift !== undefined ? new Prisma.Decimal(dto.rateShift) : specialist.rateShift,
        rateMonthly: dto.rateMonthly !== undefined ? new Prisma.Decimal(dto.rateMonthly) : specialist.rateMonthly,
        availability: dto.availability ?? specialist.availability,
        hasOwnEquipment: dto.hasOwnEquipment ?? specialist.hasOwnEquipment,
        certifications: dto.certifications ?? specialist.certifications,
        regionsServed: dto.regionsServed ?? specialist.regionsServed,
        skills: dto.skills ?? specialist.skills,
        languages: dto.languages ?? specialist.languages,
        regionId: dto.regionId ?? specialist.regionId,
        cityId: dto.cityId ?? specialist.cityId
      },
      include: { portfolio: true }
    });
    return this.toDto(updated);
  }

  async remove(id: string, user: AuthenticatedUser): Promise<void> {
    const specialist = await this.findByIdOrThrow(id);
    this.ensureCanMutate(specialist, user);
    await this.prisma.specialist.delete({ where: { id: specialist.id } });
  }

  async findPublic(id: string): Promise<SpecialistDto> {
    const specialist = await this.findByIdOrThrow(id, { includePortfolio: true });
    return this.toDto(specialist);
  }

  async list(query: SpecialistQueryDto): Promise<SpecialistListResponseDto> {
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;
    const where = this.buildWhere(query);
    const orderBy = this.buildOrderBy(query.sort ?? SpecialistSortOption.RATING_DESC);

    const [total, items, facets] = await Promise.all([
      this.prisma.specialist.count({ where }),
      this.prisma.specialist.findMany({
        where,
        include: { portfolio: true },
        take: limit,
        skip: offset,
        orderBy
      }),
      this.prisma.specialist.groupBy({
        by: ['categoryId'],
        where,
        _count: { _all: true }
      })
    ]);

    return {
      items: items.map((item) => this.toDto(item)),
      total,
      limit,
      offset,
      categoryFacets: facets.map((facet) => ({
        categoryId: facet.categoryId,
        count: facet._count._all
      }))
    };
  }

  private buildWhere(query: SpecialistQueryDto): Prisma.SpecialistWhereInput {
    const where: Prisma.SpecialistWhereInput = {
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.cityId ? { cityId: query.cityId } : {}),
      ...(query.regionId ? { regionId: query.regionId } : {}),
      ...(query.skill ? { skills: { has: query.skill } } : {}),
      ...(query.experience !== undefined ? { experienceYears: { gte: query.experience } } : {}),
      ...(query.availability ? { availability: query.availability } : {}),
      ...(query.hasEquipment ? { hasOwnEquipment: true } : {})
    };

    if (query.rateFrom !== undefined || query.rateTo !== undefined) {
      where.rateHourly = {
        ...(query.rateFrom !== undefined ? { gte: new Prisma.Decimal(query.rateFrom) } : {}),
        ...(query.rateTo !== undefined ? { lte: new Prisma.Decimal(query.rateTo) } : {})
      } as any;
    }

    return where;
  }

  private buildOrderBy(sort: SpecialistSortOption): Prisma.SpecialistOrderByWithRelationInput[] {
    switch (sort) {
      case SpecialistSortOption.EXPERIENCE_DESC:
        return [{ experienceYears: 'desc' }, { rating: 'desc' }];
      case SpecialistSortOption.PRICE_ASC:
        return [{ rateHourly: { sort: 'asc', nulls: 'last' } as any }, { rating: 'desc' }];
      case SpecialistSortOption.REVIEWS_DESC:
        return [{ reviewsCount: 'desc' }, { rating: 'desc' }];
      case SpecialistSortOption.RATING_DESC:
      default:
        return [{ rating: 'desc' }, { reviewsCount: 'desc' }];
    }
  }

  private ensureCanMutate(specialist: Specialist, user: AuthenticatedUser) {
    if (user.role === UserRole.ADMIN || user.role === UserRole.MODERATOR) {
      return;
    }
    if (specialist.userId && specialist.userId === user.id) {
      return;
    }
    throw new ForbiddenException('Not allowed to modify specialist profile');
  }

  private async findByIdOrThrow(id: string, options?: { includePortfolio?: boolean }) {
    const specialist = await this.prisma.specialist.findUnique({
      where: { id },
      include: { portfolio: options?.includePortfolio ?? false }
    });
    if (!specialist) {
      throw new NotFoundException('Specialist not found');
    }
    return specialist;
  }

  private toDto(specialist: Specialist & { portfolio: Media[] }): SpecialistDto {
    return {
      id: specialist.id,
      userId: specialist.userId,
      categoryId: specialist.categoryId,
      profession: specialist.profession,
      title: specialist.title,
      bio: specialist.bio,
      phone: specialist.phone,
      experienceYears: specialist.experienceYears,
      rateHourly: specialist.rateHourly?.toString() ?? null,
      rateShift: specialist.rateShift?.toString() ?? null,
      rateMonthly: specialist.rateMonthly?.toString() ?? null,
      availability: specialist.availability,
      hasOwnEquipment: specialist.hasOwnEquipment,
      certifications: (specialist.certifications as Record<string, any> | null) ?? null,
      regionsServed: (specialist.regionsServed as Record<string, any> | null) ?? null,
      skills: specialist.skills,
      languages: specialist.languages,
      rating: specialist.rating,
      reviewsCount: specialist.reviewsCount,
      regionId: specialist.regionId,
      cityId: specialist.cityId,
      createdAt: specialist.createdAt,
      updatedAt: specialist.updatedAt,
      portfolio: specialist.portfolio.map((media) => ({
        id: media.id,
        kind: media.kind,
        url: media.url,
        previewUrl: media.previewUrl ?? null
      }))
    };
  }
}
