import type * as PageTree from 'fumadocs-core/page-tree';

export const pageTree: PageTree.Root = {
  name: 'Demos',
  children: [
    {
      type: 'page',
      name: 'Overview',
      url: '/demos/overview',
    },
    {
      type: 'folder',
      name: 'Upload Demos',
      index: {
        type: 'page',
        name: 'Upload Demos',
        url: '/demos/data-imports/chunked-upload',
      },
      children: [
        {
          type: 'page',
          name: 'Manual Upload',
          url: '/demos/data-imports/manual-upload',
          description: 'Upload files with drag-and-drop',
        },
        {
          type: 'page',
          name: 'Chunked Upload',
          url: '/demos/data-imports/chunked-upload',
          description: 'Real chunked uploads with FileReader API',
        },
      ],
    },
    {
      type: 'page',
      name: 'Image Labeling',
      url: '/demos/image-labels',
      description: 'Draw bounding boxes on images',
    },
    {
      type: 'page',
      name: 'Text Labeling',
      url: '/demos/add-labels',
      description: 'Add labels to text data',
    },
  ],
};