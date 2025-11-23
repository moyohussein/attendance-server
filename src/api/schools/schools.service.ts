import { and, eq } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { v7 as uuid } from "uuid";
import { CreateSchoolDto, UpdateSchoolDto } from "./dto/school.dto";
import { schools } from "../../models";

export class SchoolsService {
  private static instance: SchoolsService;

  constructor(private readonly db: DrizzleD1Database<Record<string, never>>) {}

  public static getInstance(db: DrizzleD1Database<Record<string, never>>) {
    if (!this.instance) this.instance = new SchoolsService(db);
    return this.instance;
  }

  public async createSchool(data: CreateSchoolDto, ownerId: string) {
    const { name, address } = data;

    const school = await this.db
      .insert(schools)
      .values({
        id: uuid(),
        name,
        ownerId,
        address: address || null,
      })
      .returning()
      .get();

    return school;
  }

  public async getSchoolById(id: string) {
    const school = await this.db
      .select()
      .from(schools)
      .where(eq(schools.id, id))
      .get();

    if (!school) {
      throw new Error("School not found");
    }

    return school;
  }

  public async updateSchool(id: string, data: UpdateSchoolDto) {
    const { name, address } = data;

    const updatedSchool = await this.db
      .update(schools)
      .set({
        name: name || undefined,
        address: address !== undefined ? address : undefined,
        updatedAt: new Date(),
      })
      .where(eq(schools.id, id))
      .returning()
      .get();

    if (!updatedSchool) {
      throw new Error("School not found");
    }

    return updatedSchool;
  }

  public async getUserSchools(userId: string) {
    const userSchools = await this.db
      .select()
      .from(schools)
      .where(eq(schools.ownerId, userId));

    return userSchools;
  }

  public async isUserSchoolOwner(userId: string, schoolId: string): Promise<boolean> {
    const school = await this.db
      .select()
      .from(schools)
      .where(and(eq(schools.id, schoolId), eq(schools.ownerId, userId)))
      .get();

    return !!school;
  }
}