/** TikTok only accepts `product` or `product_group` for content_type. */
export const TIKTOK_CONTENT_TYPE = "product" as const;

export type TikTokContentItem = {
  contentId: string;
  contentName?: string;
  price?: number;
  quantity?: number;
};

export function buildTikTokContents(item: TikTokContentItem) {
  return [
    {
      content_id: item.contentId,
      content_type: TIKTOK_CONTENT_TYPE,
      ...(item.contentName ? { content_name: item.contentName } : {}),
      ...(item.price != null ? { price: item.price } : {}),
      quantity: item.quantity ?? 1,
    },
  ];
}
