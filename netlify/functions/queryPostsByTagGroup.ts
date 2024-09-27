import { Handler } from "@netlify/functions";
import { BlogPost, Tag } from "@prisma/client";
import { getNetlifyFunctionHandler } from "../utils/getNetlifyFunctionHandler";
import { QueryCacheKeys, GLOBAL_CACHE_EXPIRY } from "../utils/constants";

const TAG_FEATURED = 'featured';

type BlogPostWithTags = BlogPost & {
  tags: {
    tag: Tag;
  }[];
};

interface PostsByTagGroupResult {
  tag: Partial<Tag>;  
  posts: BlogPostWithTags[];
}

interface ResponseData {
  featuredPosts: BlogPost[];
  tagGroups: PostsByTagGroupResult[];
}

export const handler: Handler = async (event) => {
  return await getNetlifyFunctionHandler<ResponseData>({
    errorMessage: 'Failed to fetch posts by tag group',
    cacheConfig: {
      key: QueryCacheKeys.HOMEPAGE_CACHE_KEY,
      expiry: GLOBAL_CACHE_EXPIRY
    },
    getQueryResponse: async ({ prisma }) => {
      const queryStringParameters = event.queryStringParameters || {};
      const { tagNames, maxItemsPerTag } = queryStringParameters;

      const tagNameCollection = tagNames?.split(',') || [];
      const totalMaxItemsPerTag = parseInt(maxItemsPerTag || '4', 10);

      const [tagGroups, featuredPosts] = await Promise.all([
        Promise.all(tagNameCollection.map(async (tagName) => {
          const isFeaturedTag = tagName === TAG_FEATURED;
          const featuredMultiplier = isFeaturedTag ? 2 : 1;
          const posts = await prisma.blogPost.findMany({
            where: { tags: { some: { tag: { name: tagName }}}},
            include: { tags: { include: { tag: true }}},
            // orderBy: { createdAt: 'desc' },
            take: totalMaxItemsPerTag * featuredMultiplier
          });

          return {
            tag: posts[0]?.tags[0]?.tag ?? { name: tagName },
            posts: posts as BlogPostWithTags[]
          };
        })),
        prisma.blogPost.findMany({
          where: { featured: true },
          orderBy: { createdAt: 'desc' },
          take: totalMaxItemsPerTag
        })
      ]);

      console.log('featuredPosts', featuredPosts);

      return { featuredPosts, tagGroups };
    }
  });
};
