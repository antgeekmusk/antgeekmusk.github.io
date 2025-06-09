import tagColors from '../../public/data/blog/tag_color_config.json';

type TagColors = {
    [key: string]: string;
};

const typedTagColors: TagColors = tagColors;

export const getTagColor = (tag: string): string => {
    return typedTagColors[tag] || 'default'; // Default to 'default' if the tag is not found
};
