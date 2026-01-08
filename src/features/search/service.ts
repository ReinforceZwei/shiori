import { ServiceBase } from "@/lib/service-base.class";
import { Bookmark } from "@/generated/prisma/client";
import { z } from "zod";

const searchQuerySchema = z.object({
  query: z.string(),
  userId: z.string(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

export class SearchService extends ServiceBase {
  async searchFts(data: z.infer<typeof searchQuerySchema>) {
    const validatedData = searchQuerySchema.parse(data);
    const limit = validatedData.limit ?? 10;
    const offset = validatedData.offset ?? 0;
    return await this.prisma.$queryRaw<Bookmark[]>`
SELECT
	*
FROM
	"Bookmark"
WHERE
	(
		SETWEIGHT(TO_TSVECTOR('english', COALESCE(TITLE, '')), 'A') || SETWEIGHT(
			TO_TSVECTOR('simple', COALESCE(TRANSLATE(URL, '.', ' '), '')),
			'B'
		) || SETWEIGHT(
			TO_TSVECTOR('english', COALESCE(DESCRIPTION, '')),
			'C'
		) @@ TO_TSQUERY(
			'simple',
			WEBSEARCH_TO_TSQUERY('simple', ${validatedData.query})::TEXT || ':*'
		)
	)
	AND "userId" = ${validatedData.userId}
ORDER BY
	TS_RANK(
		SETWEIGHT(TO_TSVECTOR('english', COALESCE(TITLE, '')), 'A') || SETWEIGHT(
			TO_TSVECTOR('simple', COALESCE(TRANSLATE(URL, '.', ' '), '')),
			'B'
		) || SETWEIGHT(
			TO_TSVECTOR('english', COALESCE(DESCRIPTION, '')),
			'C'
		),
		TO_TSQUERY(
			'simple',
			WEBSEARCH_TO_TSQUERY('simple', ${validatedData.query})::TEXT || ':*'
		)
	) DESC
LIMIT ${limit} OFFSET ${offset};
    `
  }

  async search(data: z.infer<typeof searchQuerySchema>) {
    const validatedData = searchQuerySchema.parse(data);
    const limit = validatedData.limit ?? 10;
    const offset = validatedData.offset ?? 0;
    return await this.prisma.bookmark.findMany({
      where: {
        OR: [
          { title: { contains: validatedData.query, mode: "insensitive" } },
          { url: { contains: validatedData.query, mode: "insensitive" } },
          { description: { contains: validatedData.query, mode: "insensitive" } },
        ],
        userId: validatedData.userId,
      },
      include: { websiteIcon: { select: { id: true }}},
      take: limit,
      skip: offset,
    });
  }
}