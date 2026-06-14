export interface StoryPage {
  id: string;
  pageNumber: number;
  text: string;
  imageCaption?: string;
  imageGradient?: string;
}

export interface StoryChapter {
  id: string;
  title: string;
  pageStart: number;
}
